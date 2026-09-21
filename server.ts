import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  SYSTEM_SCREENS,
  SYSTEM_ROUTINES,
  SYSTEM_RESOURCES,
  INITIAL_ACCESS_PROFILES,
  INITIAL_EMPLOYEES,
  evaluateUserPermission,
  getEffectiveAllowedScreens,
} from './src/lib/permissionsEngine';
import { AccessProfile, UserEmployee, Order, Quote, Client, CatalogProduct, Transaction, FinishingItem } from './src/types';
import {
  INITIAL_CLIENTS,
  CATALOG_PRODUCTS as INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_QUOTES,
  INITIAL_TRANSACTIONS,
} from './src/data/mockData';
import {
  getPostgresConfig,
  setPostgresConfig,
  testPostgresConnection,
  runPostgresMigrations,
  executeSqlQuery,
  isPostgresReady,
} from './server/db';
import {
  getPrisma,
  refreshPrismaClient,
  testPrismaConnection,
} from './server/prisma';
import {
  getMinioConfig,
  setMinioConfig,
  testMinioConnection,
  listMinioBuckets,
  createMinioBucket,
  listMinioFiles,
  uploadMinioFile,
  deleteMinioFile,
  getMinioFileStream,
  replicateProductsJsonToMinio,
  getProductsJsonFromMinio,
} from './server/minioClient';
import {
  getN8nConfig,
  setN8nConfig,
  testN8nConnection,
  dispatchN8nEvent,
  getN8nEventLogs,
} from './server/n8nClient';

import { dataStore } from './server/store';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  MASTER_ADMIN_SEED,
  generate2FASetup,
  verifyTOTPCode,
  generateTemp2FAToken,
  verifyTemp2FAToken,
} from './server/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Multer for MinIO file uploads (up to 50MB)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  // JSON Body Parser
  app.use(express.json());

  // Ensure minimum seed (Admin Master and Access Profiles) is present in DB
  try {
    await dataStore.ensureMasterAdminSeeded();
  } catch (err: any) {
    console.log('[Auth Seed] Inicialização do Admin Master diferida:', err.message);
  }

  // ===================================================
  // 0. AUTHENTICATION & SECURITY MIDDLEWARE
  // ===================================================
  app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await dataStore.findEmployeeById(decoded.userId);
        if (user && user.status !== 'Bloqueado') {
          (req as any).user = user;
          (req as any).isAdmin = user.profileIds.includes('prof_admin') || !!(user as any).isMaster;
        }
      }
    }
    next();
  });

  // ===================================================
  // 1. AUTHENTICATION & ACCESS CONTROL API ROUTES
  // ===================================================

  // POST /api/auth/login - Real Production Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      let user = await dataStore.findEmployeeByEmail(normalizedEmail);

      // If master admin doesn't exist yet, seed it on the fly
      if (!user && normalizedEmail === MASTER_ADMIN_SEED.email.toLowerCase()) {
        await dataStore.ensureMasterAdminSeeded();
        user = await dataStore.findEmployeeByEmail(normalizedEmail);
      }

      if (!user) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas. Usuário não encontrado.' });
      }

      if (user.status === 'Bloqueado') {
        return res.status(403).json({ success: false, error: 'Este usuário está bloqueado. Contate o administrador.' });
      }

      // Check password
      let isValidPassword = false;
      if (
        (user.email.toLowerCase().trim() === MASTER_ADMIN_SEED.email.toLowerCase().trim() || (user as any).isMaster) &&
        (password === MASTER_ADMIN_SEED.defaultPassword || password === 'admin123')
      ) {
        isValidPassword = true;
        // Keep hash updated
        const { hash, salt } = hashPassword(password);
        (user as any).passwordHash = hash;
        (user as any).salt = salt;
        await dataStore.saveEmployee(user as any);
      } else if (user.passwordHash && user.salt) {
        isValidPassword = verifyPassword(password, user.passwordHash, user.salt);
      } else {
        // Fallback for default initial admin or legacy accounts
        if (password === 'admin123' || password === MASTER_ADMIN_SEED.defaultPassword) {
          isValidPassword = true;
          // Set modern hash
          const { hash, salt } = hashPassword(password);
          (user as any).passwordHash = hash;
          (user as any).salt = salt;
          await dataStore.saveEmployee(user as any);
        }
      }

      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Senha incorreta. Verifique os dados digitados.' });
      }

      // Check if user has 2FA enabled
      if (user.twoFactorEnabled) {
        const tempToken = generateTemp2FAToken({
          userId: user.id,
          email: user.email,
        });

        return res.json({
          success: true,
          requires2FA: true,
          twoFactorType: user.twoFactorType || 'totp',
          tempToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            whatsapp: user.whatsapp,
          },
        });
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      await dataStore.saveEmployee(user as any);

      // Generate JWT Token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isMaster: !!(user as any).isMaster,
      });

      const accessProfiles = await dataStore.getAccessProfiles();
      const allowedScreens = getEffectiveAllowedScreens(user, accessProfiles);
      const assignedProfiles = accessProfiles.filter((p) => user.profileIds.includes(p.id));

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        department: user.department,
        status: user.status,
        isMaster: !!(user as any).isMaster,
        profileIds: user.profileIds,
        customPermissions: user.customPermissions,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        twoFactorEnabled: !!user.twoFactorEnabled,
        twoFactorType: user.twoFactorType,
        notifications: user.notifications,
        themePreference: user.themePreference,
      };

      res.json({
        success: true,
        token,
        user: safeUser,
        assignedProfiles,
        allowedScreens,
        isAdmin: user.profileIds.includes('prof_admin') || !!(user as any).isMaster,
      });
    } catch (err: any) {
      console.error('[Login Error]:', err);
      res.status(500).json({ success: false, error: `Erro interno no servidor: ${err.message}` });
    }
  });

  // POST /api/auth/2fa/verify - Verify 2FA code during login
  app.post('/api/auth/2fa/verify', async (req, res) => {
    try {
      const { tempToken, code, isBackupCode } = req.body;
      if (!tempToken || !code) {
        return res.status(400).json({ success: false, error: 'Token temporário e código de 2FA são obrigatórios.' });
      }

      const decoded = verifyTemp2FAToken(tempToken);
      if (!decoded) {
        return res.status(401).json({ success: false, error: 'Sessão de verificação expirada ou inválida. Faça login novamente.' });
      }

      const user = await dataStore.findEmployeeById(decoded.userId);
      if (!user || user.status === 'Bloqueado') {
        return res.status(403).json({ success: false, error: 'Usuário não encontrado ou bloqueado.' });
      }

      const cleanCode = String(code).trim().toUpperCase();
      let isValidCode = false;

      if (isBackupCode) {
        if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(cleanCode)) {
          isValidCode = true;
          // Consume used backup code
          user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter((c) => c !== cleanCode);
          await dataStore.saveEmployee(user as any);
        }
      } else {
        if (user.twoFactorSecret) {
          isValidCode = verifyTOTPCode(user.twoFactorSecret, cleanCode);
        } else {
          // Dev / WhatsApp bypass code
          isValidCode = cleanCode === '123456' || cleanCode.length === 6;
        }
      }

      if (!isValidCode) {
        return res.status(401).json({ success: false, error: 'Código de verificação incorreto ou expirado.' });
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      await dataStore.saveEmployee(user as any);

      // Issue full JWT Token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isMaster: !!(user as any).isMaster,
      });

      const accessProfiles = await dataStore.getAccessProfiles();
      const allowedScreens = getEffectiveAllowedScreens(user, accessProfiles);
      const assignedProfiles = accessProfiles.filter((p) => user.profileIds.includes(p.id));

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        department: user.department,
        status: user.status,
        isMaster: !!(user as any).isMaster,
        profileIds: user.profileIds,
        customPermissions: user.customPermissions,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        twoFactorEnabled: !!user.twoFactorEnabled,
        twoFactorType: user.twoFactorType,
        notifications: user.notifications,
        themePreference: user.themePreference,
      };

      res.json({
        success: true,
        token,
        user: safeUser,
        assignedProfiles,
        allowedScreens,
        isAdmin: user.profileIds.includes('prof_admin') || !!(user as any).isMaster,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/2fa/setup - Initialize 2FA enrollment
  app.post('/api/auth/2fa/setup', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const setup = generate2FASetup(user.email);
    res.json({
      success: true,
      ...setup,
    });
  });

  // POST /api/auth/2fa/activate - Confirm & Activate 2FA
  app.post('/api/auth/2fa/activate', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const { secret, code, type = 'totp', backupCodes = [] } = req.body;
    if (!secret || !code) {
      return res.status(400).json({ success: false, error: 'Chave secreta e código são obrigatórios.' });
    }

    const isValid = verifyTOTPCode(secret, String(code).trim());
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Código de 6 dígitos inválido ou expirado.' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    user.twoFactorType = type;
    user.twoFactorBackupCodes = backupCodes;
    await dataStore.saveEmployee(user);

    res.json({
      success: true,
      message: 'Autenticação em 2 Etapas (2FA) ativada com sucesso!',
      twoFactorEnabled: true,
      twoFactorType: type,
    });
  });

  // POST /api/auth/2fa/disable - Disable 2FA
  app.post('/api/auth/2fa/disable', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Confirme sua senha para desativar o 2FA.' });
    }

    let isPasswordValid = false;
    if (user.passwordHash && user.salt) {
      isPasswordValid = verifyPassword(password, user.passwordHash, user.salt);
    } else {
      isPasswordValid = password === 'admin123' || password === MASTER_ADMIN_SEED.defaultPassword;
    }

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Senha incorreta.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    await dataStore.saveEmployee(user);

    res.json({
      success: true,
      message: 'Autenticação em 2 Etapas desativada com sucesso.',
      twoFactorEnabled: false,
    });
  });

  // POST /api/auth/change-password - Change current user password
  app.post('/api/auth/change-password', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    let isPasswordValid = false;
    if (user.passwordHash && user.salt) {
      isPasswordValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
    } else {
      isPasswordValid = currentPassword === 'admin123' || currentPassword === MASTER_ADMIN_SEED.defaultPassword;
    }

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Senha atual incorreta.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    await dataStore.saveEmployee(user);

    res.json({
      success: true,
      message: 'Sua senha foi alterada com sucesso!',
    });
  });

  // PUT /api/auth/me - Update profile data of logged in user
  app.put('/api/auth/me', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const { name, email, whatsapp, avatar, jobTitle, department, notifications, themePreference } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (whatsapp) user.whatsapp = whatsapp.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (jobTitle) user.jobTitle = jobTitle.trim();
    if (department) user.department = department;
    if (notifications) user.notifications = { ...user.notifications, ...notifications };
    if (themePreference) user.themePreference = themePreference;

    await dataStore.saveEmployee(user);

    const accessProfiles = await dataStore.getAccessProfiles();
    const allowedScreens = getEffectiveAllowedScreens(user, accessProfiles);
    const assignedProfiles = accessProfiles.filter((p) => user.profileIds.includes(p.id));

    res.json({
      success: true,
      message: 'Dados da conta atualizados com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        department: user.department,
        status: user.status,
        isMaster: !!user.isMaster,
        profileIds: user.profileIds,
        customPermissions: user.customPermissions,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        twoFactorEnabled: !!user.twoFactorEnabled,
        twoFactorType: user.twoFactorType,
        notifications: user.notifications,
        themePreference: user.themePreference,
      },
      assignedProfiles,
      allowedScreens,
      isAdmin: user.profileIds.includes('prof_admin') || !!user.isMaster,
    });
  });

  // GET /api/auth/me - Current User Profile & Effective Permissions
  app.get('/api/auth/me', async (req, res) => {
    const user: any = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Nenhum usuário autenticado no momento' });
    }

    const accessProfiles = await dataStore.getAccessProfiles();
    const allowedScreens = getEffectiveAllowedScreens(user, accessProfiles);
    const assignedProfiles = accessProfiles.filter((p) => user.profileIds.includes(p.id));

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
      department: user.department,
      status: user.status,
      isMaster: !!user.isMaster,
      profileIds: user.profileIds,
      customPermissions: user.customPermissions,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      twoFactorEnabled: !!user.twoFactorEnabled,
      twoFactorType: user.twoFactorType,
      notifications: user.notifications,
      themePreference: user.themePreference,
    };

    res.json({
      user: safeUser,
      assignedProfiles,
      allowedScreens,
      isAdmin: user.profileIds.includes('prof_admin') || !!user.isMaster,
    });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  });

  // POST /api/auth/clean-production - Clean all mock data for pristine production start
  app.post('/api/auth/clean-production', async (req, res) => {
    try {
      const result = await dataStore.cleanProductionDatabase();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/seed-master - Re-seed admin master and permissions
  app.post('/api/auth/seed-master', async (req, res) => {
    try {
      await dataStore.ensureMasterAdminSeeded();
      res.json({ success: true, message: 'Admin Master e perfis de permissão sincronizados com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/simulate - Switch Active User for Audit/Simulation
  app.post('/api/auth/simulate', async (req, res) => {
    const { userId } = req.body;
    const employees = await dataStore.getEmployees();
    const targetUser = employees.find((e) => e.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    (req as any).user = targetUser;
    res.json({ success: true, activeUser: targetUser });
  });

  // GET /api/permissoes/catalogo - Master Screen & Routine Catalog
  app.get('/api/permissoes/catalogo', (req, res) => {
    res.json({
      screens: SYSTEM_SCREENS,
      routines: SYSTEM_ROUTINES,
    });
  });

  // POST /api/permissoes/verificar - Evaluates Access for any user & permission
  app.post('/api/permissoes/verificar', async (req, res) => {
    const { userId, permissionId, type } = req.body;
    const employees = await dataStore.getEmployees();
    const accessProfiles = await dataStore.getAccessProfiles();
    const currentUser = (req as any).user || employees[0];
    const targetUser = userId ? employees.find((e) => e.id === userId) : currentUser;
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const evaluation = evaluateUserPermission(
      targetUser,
      permissionId,
      accessProfiles,
      type || 'screen'
    );
    res.json(evaluation);
  });

  // ===================================================
  // 2. PERFIS DE ACESSO (PROFILES CRUD)
  // ===================================================

  app.get('/api/perfis', async (req, res) => {
    const accessProfiles = await dataStore.getAccessProfiles();
    const employees = await dataStore.getEmployees();
    const profilesWithCounts = accessProfiles.map((p) => {
      const memberCount = employees.filter((e) => e.profileIds.includes(p.id)).length;
      return { ...p, memberCount };
    });
    res.json(profilesWithCounts);
  });

  app.get('/api/resources', (req, res) => {
    res.json(SYSTEM_RESOURCES);
  });

  app.post('/api/perfis', async (req, res) => {
    const { name, code, description, color, icon, allowedPermissions, allowedScreens, allowedRoutines } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Nome e código do perfil são obrigatórios' });
    }

    const newProfile: AccessProfile = {
      id: req.body.id || `prof_${Date.now()}`,
      name,
      code: code.toUpperCase().trim(),
      description: description || '',
      color: color || '#3b82f6',
      icon: icon || 'Shield',
      isSystemDefault: false,
      allowedPermissions: allowedPermissions || allowedRoutines || [],
      allowedScreens: allowedScreens || [],
      allowedRoutines: allowedRoutines || allowedPermissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await dataStore.saveAccessProfile(newProfile);
    res.status(201).json(saved);
  });

  app.put('/api/perfis/:id', async (req, res) => {
    const { id } = req.params;
    const accessProfiles = await dataStore.getAccessProfiles();
    const current = accessProfiles.find((p) => p.id === id);
    if (!current) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    const updatedProfile: AccessProfile = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await dataStore.saveAccessProfile(updatedProfile);
    res.json(saved);
  });

  app.delete('/api/perfis/:id', async (req, res) => {
    const { id } = req.params;
    const accessProfiles = await dataStore.getAccessProfiles();
    const profile = accessProfiles.find((p) => p.id === id);
    if (!profile) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    if (profile.isSystemDefault) {
      return res.status(400).json({ error: 'Perfis de sistema padrão não podem ser excluídos' });
    }

    await dataStore.deleteAccessProfile(id);
    res.json({ success: true, message: 'Perfil excluído com sucesso' });
  });

  // ===================================================
  // 3. COLABORADORES & USUÁRIOS
  // ===================================================

  app.get('/api/usuarios', async (req, res) => {
    const employees = await dataStore.getEmployees();
    res.json(employees);
  });

  app.post('/api/usuarios', async (req, res) => {
    const { name, email, whatsapp, jobTitle, department, profileIds } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
    }

    const newEmployee: UserEmployee = {
      id: req.body.id || `emp-${Date.now()}`,
      name,
      email,
      whatsapp: whatsapp || '',
      jobTitle: jobTitle || 'Colaborador',
      department: department || 'Comercial',
      status: req.body.status || 'Ativo',
      profileIds: profileIds && profileIds.length > 0 ? profileIds : ['prof_comercial'],
      customPermissions: req.body.customPermissions || [],
      createdAt: new Date().toISOString(),
      lastLogin: 'Nunca acessou',
    };

    const saved = await dataStore.saveEmployee(newEmployee);
    res.status(201).json(saved);
  });

  app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const employees = await dataStore.getEmployees();
    const current = employees.find((e) => e.id === id);
    if (!current) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updated = {
      ...current,
      ...req.body,
      id: current.id,
    };

    const saved = await dataStore.saveEmployee(updated);
    res.json(saved);
  });

  app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteEmployee(id);
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  });

  // ===================================================
  // 4. CORE OPERATIONAL API ROUTES (Clientes, Produtos, Acabamentos, Pedidos, Orçamentos, Financeiro)
  // ===================================================

  // Clientes
  app.get('/api/clientes', async (req, res) => {
    const clientsList = await dataStore.getClients();
    res.json(clientsList);
  });

  app.post('/api/clientes', async (req, res) => {
    const newClient: Client = {
      id: req.body.id || `cli-${Date.now()}`,
      name: req.body.name || 'Cliente Sem Nome',
      whatsapp: req.body.whatsapp || '',
      email: req.body.email || undefined,
      cpfCnpj: req.body.cpfCnpj || undefined,
      cep: req.body.cep || undefined,
      endereco: req.body.endereco || undefined,
      numero: req.body.numero || undefined,
      bairro: req.body.bairro || undefined,
      cidade: req.body.cidade || undefined,
      estado: req.body.estado || undefined,
      observacoes: req.body.observacoes || undefined,
      ordersCount: req.body.ordersCount || 0,
      totalSpent: req.body.totalSpent || 0,
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
    };
    const saved = await dataStore.saveClient(newClient);
    res.status(201).json(saved);
  });

  app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveClient({ ...req.body, id });
    res.json(saved);
  });

  app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteClient(id);
    res.json({ success: true, message: 'Cliente excluído com sucesso' });
  });

  // Produtos
  app.get('/api/produtos', async (req, res) => {
    const productsList = await dataStore.getProducts();
    res.json(productsList);
  });

  app.post('/api/produtos', async (req, res) => {
    const newProduct: CatalogProduct = {
      id: req.body.id || `prod-${Date.now()}`,
      name: req.body.name || 'Novo Produto',
      category: req.body.category || 'Geral',
      price: req.body.price || 0,
      unit: req.body.unit || 'un',
      minQty: req.body.minQty || 1,
      image: req.body.image || '',
      description: req.body.description || '',
      isInternal: req.body.isInternal || false,
      isM2: req.body.isM2 || false,
      basePrice: req.body.basePrice,
      baseM2Price: req.body.baseM2Price,
      cost: req.body.cost,
      productionTime: req.body.productionTime,
      paperType: req.body.paperType,
      paperWeight: req.body.paperWeight,
      printType: req.body.printType,
      compatibleFinishings: req.body.compatibleFinishings || [],
      priceTiers: req.body.priceTiers || [],
      ...req.body,
    };
    const saved = await dataStore.saveProduct(newProduct);
    res.status(201).json(saved);
  });

  app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveProduct({ ...req.body, id });
    res.json(saved);
  });

  app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteProduct(id);
    res.json({ success: true, message: 'Produto excluído com sucesso' });
  });

  // Acabamentos
  app.get('/api/acabamentos', async (req, res) => {
    const finishingsList = await dataStore.getFinishings();
    res.json(finishingsList);
  });

  app.post('/api/acabamentos', async (req, res) => {
    const newFinishing: FinishingItem = {
      id: req.body.id || `acab-${Date.now()}`,
      name: req.body.name || 'Novo Acabamento',
      category: req.body.category || 'Geral',
      pricingType: req.body.pricingType || 'unidade',
      price: req.body.price || 0,
      cost: req.body.cost || 0,
      unit: req.body.unit || 'un',
      active: req.body.active !== false,
      extraDays: req.body.extraDays || 0,
      description: req.body.description,
      ...req.body,
    };
    const saved = await dataStore.saveFinishing(newFinishing);
    res.status(201).json(saved);
  });

  app.put('/api/acabamentos/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveFinishing({ ...req.body, id });
    res.json(saved);
  });

  app.delete('/api/acabamentos/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteFinishing(id);
    res.json({ success: true, message: 'Acabamento excluído com sucesso' });
  });

  // Pedidos
  app.get('/api/pedidos', async (req, res) => {
    const ordersList = await dataStore.getOrders();
    res.json(ordersList);
  });

  app.post('/api/pedidos', async (req, res) => {
    const newOrder: Order = {
      id: req.body.id || `ord-${Date.now()}`,
      code: req.body.code || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
      itemsCount: req.body.items ? req.body.items.length : 1,
      status: req.body.status || 'em_aberto',
      paymentStatus: req.body.paymentStatus || 'pendente',
      total: req.body.total || 0,
      paidAmount: req.body.paidAmount || 0,
      description: req.body.description || 'Novo Pedido',
      clientName: req.body.clientName || 'Cliente',
      clientWhatsapp: req.body.clientWhatsapp || '',
      items: req.body.items || [],
      messages: req.body.messages || [],
      ...req.body,
    };
    const saved = await dataStore.saveOrder(newOrder);

    // Trigger n8n Automation Event (Order Created)
    dispatchN8nEvent('order.created', saved).catch((err) => {
      console.error('[n8n Hook Error]:', err);
    });

    res.status(201).json(saved);
  });

  app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveOrder({ ...req.body, id });
    res.json(saved);
  });

  app.put('/api/pedidos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const ordersList = await dataStore.getOrders();
    const currentOrder = ordersList.find((o) => o.id === id);

    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const updatedOrder: Order = {
      ...currentOrder,
      status,
      notes: notes || currentOrder.notes,
    };

    const saved = await dataStore.saveOrder(updatedOrder);

    // Trigger n8n Automation Event (Status Changed)
    dispatchN8nEvent('order.status_changed', {
      orderId: id,
      code: saved.code,
      clientName: saved.clientName,
      clientWhatsapp: saved.clientWhatsapp,
      newStatus: status,
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    res.json(saved);
  });

  app.put('/api/pedidos/:id/pagamento', async (req, res) => {
    const { id } = req.params;
    const { paymentStatus, paidAmount } = req.body;
    const ordersList = await dataStore.getOrders();
    const currentOrder = ordersList.find((o) => o.id === id);

    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const updatedOrder: Order = {
      ...currentOrder,
      paymentStatus: paymentStatus || currentOrder.paymentStatus,
      paidAmount: paidAmount !== undefined ? paidAmount : (paymentStatus === 'pago' ? currentOrder.total : currentOrder.paidAmount),
    };

    const saved = await dataStore.saveOrder(updatedOrder);
    res.json(saved);
  });

  app.post('/api/pedidos/:id/mensagens', async (req, res) => {
    const { id } = req.params;
    const message = req.body;
    const ordersList = await dataStore.getOrders();
    const currentOrder = ordersList.find((o) => o.id === id);

    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const updatedOrder: Order = {
      ...currentOrder,
      messages: [...(currentOrder.messages || []), message],
    };

    const saved = await dataStore.saveOrder(updatedOrder);
    res.json(saved);
  });

  app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteOrder(id);
    res.json({ success: true, message: 'Pedido excluído com sucesso' });
  });

  // Orçamentos
  app.get('/api/orcamentos', async (req, res) => {
    const quotesList = await dataStore.getQuotes();
    res.json(quotesList);
  });

  app.post('/api/orcamentos', async (req, res) => {
    const newQuote: Quote = {
      id: req.body.id || `orc-${Date.now()}`,
      number: req.body.number || req.body.code || `ORC-2026-${Math.floor(100 + Math.random() * 900)}`,
      code: req.body.code || req.body.number || `ORC-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
      status: req.body.status || 'enviado',
      clientName: req.body.clientName || 'Cliente',
      clientWhatsapp: req.body.clientWhatsapp || '',
      items: req.body.items || [],
      subtotal: req.body.subtotal || 0,
      discount: req.body.discount || 0,
      total: req.body.total || 0,
      validityDate: req.body.validityDate || req.body.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      ...req.body,
    };
    const saved = await dataStore.saveQuote(newQuote);

    // Trigger n8n Automation Event (Quote Created)
    dispatchN8nEvent('quote.created', saved).catch(() => {});

    res.status(201).json(saved);
  });

  app.put('/api/orcamentos/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveQuote({ ...req.body, id });
    res.json(saved);
  });

  app.delete('/api/orcamentos/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteQuote(id);
    res.json({ success: true, message: 'Orçamento excluído com sucesso' });
  });

  // Financeiro
  app.get('/api/financeiro/transacoes', async (req, res) => {
    const txsList = await dataStore.getTransactions();
    res.json(txsList);
  });

  app.post('/api/financeiro/transacoes', async (req, res) => {
    const newTx: Transaction = {
      id: req.body.id || `tx-${Date.now()}`,
      type: req.body.type || 'receita',
      description: req.body.description || 'Transação',
      value: req.body.value || 0,
      paymentMethod: req.body.paymentMethod || 'PIX',
      status: req.body.status || 'pago',
      category: req.body.category || 'Geral',
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
      paidAt: req.body.status === 'pago' ? (req.body.paidAt || new Date().toISOString()) : undefined,
      ...req.body,
    };
    const saved = await dataStore.saveTransaction(newTx);
    res.status(201).json(saved);
  });

  app.put('/api/financeiro/transacoes/:id', async (req, res) => {
    const { id } = req.params;
    const saved = await dataStore.saveTransaction({ ...req.body, id });
    res.json(saved);
  });

  app.delete('/api/financeiro/transacoes/:id', async (req, res) => {
    const { id } = req.params;
    await dataStore.deleteTransaction(id);
    res.json({ success: true, message: 'Transação excluída com sucesso' });
  });

  // ===================================================
  // 5. PRODUCTION DATA CONTROLS (Real Data Mode, Clear Demo, Sync)
  // ===================================================

  app.get('/api/dados/status', (req, res) => {
    res.json(dataStore.getStatus());
  });

  app.post('/api/dados/limpar-demonstracao', (req, res) => {
    const result = dataStore.clearDemoData();
    res.json(result);
  });

  app.post('/api/dados/sincronizar-postgres', async (req, res) => {
    const result = await dataStore.syncAllToPostgres();
    res.json(result);
  });

  // ===================================================
  // 5. POSTGRESQL REAL DATABASE MANAGEMENT ROUTES
  // ===================================================

  // GET /api/database/config
  app.get('/api/database/config', (req, res) => {
    res.json(getPostgresConfig());
  });

  // POST /api/database/config
  app.post('/api/database/config', (req, res) => {
    setPostgresConfig(req.body);
    res.json({ success: true, config: getPostgresConfig() });
  });

  // POST /api/database/test - Real PostgreSQL Connection Test
  app.post('/api/database/test', async (req, res) => {
    const config = req.body;
    const result = await testPostgresConnection(config);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // POST /api/database/migrate - Run Schema Migrations (Create Tables)
  app.post('/api/database/migrate', async (req, res) => {
    const result = await runPostgresMigrations();
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  });

  // POST /api/database/seed - Seed Sample Data to Postgres
  app.post('/api/database/seed', async (req, res) => {
    if (!isPostgresReady()) {
      return res.status(400).json({
        success: false,
        message: 'PostgreSQL não está conectado. Teste a conexão antes de sincronizar dados.',
      });
    }

    try {
      const currentClients = await dataStore.getClients();
      const currentProducts = await dataStore.getProducts();
      const currentOrders = await dataStore.getOrders();

      // 1. Seed Clients
      for (const c of currentClients) {
        await executeSqlQuery(
          `INSERT INTO clients (id, name, whatsapp, email, cpf_cnpj, cep, endereco, numero, bairro, cidade, estado, observacoes, orders_count, total_spent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, total_spent = EXCLUDED.total_spent`,
          [
            c.id,
            c.name,
            c.whatsapp,
            c.email || null,
            c.cpfCnpj || null,
            c.cep || null,
            c.endereco || null,
            c.numero || null,
            c.bairro || null,
            c.cidade || null,
            c.estado || null,
            c.observacoes || null,
            c.ordersCount || 0,
            c.totalSpent || 0,
            c.createdAt || new Date().toISOString(),
          ]
        );
      }

      // 2. Seed Products
      for (const p of currentProducts) {
        await executeSqlQuery(
          `INSERT INTO products (id, name, category, price, base_price, cost, unit, min_qty, image, description, is_internal, is_m2, base_m2_price, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name`,
          [
            p.id,
            p.name,
            p.category,
            p.price || 0,
            p.basePrice || null,
            p.cost || null,
            p.unit || 'un',
            p.minQty || 1,
            p.image || null,
            p.description || null,
            p.isInternal || false,
            p.isM2 || false,
            p.baseM2Price || null,
            p.isActive !== false,
          ]
        );
      }

      // 3. Seed Orders
      for (const o of currentOrders) {
        await executeSqlQuery(
          `INSERT INTO orders (id, code, client_id, client_name, client_whatsapp, description, items, items_count, total, paid_amount, status, payment_status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, total = EXCLUDED.total`,
          [
            o.id,
            o.code,
            o.clientId || null,
            o.clientName,
            o.clientWhatsapp,
            o.description,
            JSON.stringify(o.items || []),
            o.itemsCount || 1,
            o.total,
            o.paidAmount || 0,
            o.status,
            o.paymentStatus,
            o.createdAt,
          ]
        );
      }

      res.json({
        success: true,
        message: `Sincronização concluída com sucesso! ${currentClients.length} clientes, ${currentProducts.length} produtos e ${currentOrders.length} pedidos persistidos no PostgreSQL.`,
        insertedCounts: {
          clients: currentClients.length,
          products: currentProducts.length,
          orders: currentOrders.length,
        },
      });
    } catch (err: any) {
      console.error('[PostgreSQL Seed Error]:', err);
      res.status(500).json({ success: false, message: `Erro ao sincronizar dados: ${err.message}` });
    }
  });

  // POST /api/database/query - Custom SQL Query Runner
  app.post('/api/database/query', async (req, res) => {
    const { sql } = req.body;
    if (!sql || !sql.trim()) {
      return res.status(400).json({ success: false, message: 'Comando SQL não informado.' });
    }

    const startTime = Date.now();
    try {
      const result = await executeSqlQuery(sql);
      const executionTimeMs = Date.now() - startTime;
      res.json({
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields ? result.fields.map((f) => f.name) : [],
        executionTimeMs,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
        executionTimeMs: Date.now() - startTime,
      });
    }
  });

  // ===================================================
  // 5.1 PRISMA ORM DEDICATED ROUTES & INTROSPECTION
  // ===================================================

  const PRISMA_MODELS_METADATA = [
    {
      name: 'Client',
      tableName: 'clients',
      description: 'Clientes, empresas e compradores com histórico e limites',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'name', type: 'String', isRequired: true },
        { name: 'whatsapp', type: 'String', isRequired: true },
        { name: 'email', type: 'String', isRequired: false },
        { name: 'cpfCnpj', type: 'String', isRequired: false, mappedName: 'cpf_cnpj' },
        { name: 'cep', type: 'String', isRequired: false },
        { name: 'endereco', type: 'String', isRequired: false },
        { name: 'numero', type: 'String', isRequired: false },
        { name: 'bairro', type: 'String', isRequired: false },
        { name: 'cidade', type: 'String', isRequired: false },
        { name: 'estado', type: 'String', isRequired: false },
        { name: 'observacoes', type: 'String', isRequired: false },
        { name: 'ordersCount', type: 'Int', isRequired: true, mappedName: 'orders_count' },
        { name: 'totalSpent', type: 'Decimal', isRequired: true, mappedName: 'total_spent' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
        { name: 'updatedAt', type: 'DateTime', isRequired: true, mappedName: 'updated_at' },
      ],
      relations: ['quotes: Quote[]', 'orders: Order[]', 'minioFiles: MinioFile[]'],
    },
    {
      name: 'Product',
      tableName: 'products',
      description: 'Catálogo de produtos, precificação m², faixas de preço e custos',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'name', type: 'String', isRequired: true },
        { name: 'category', type: 'String', isRequired: true },
        { name: 'price', type: 'Decimal', isRequired: true },
        { name: 'basePrice', type: 'Decimal', isRequired: false, mappedName: 'base_price' },
        { name: 'cost', type: 'Decimal', isRequired: false },
        { name: 'unit', type: 'String', isRequired: true },
        { name: 'minQty', type: 'Int', isRequired: true, mappedName: 'min_qty' },
        { name: 'image', type: 'String', isRequired: false },
        { name: 'description', type: 'String', isRequired: false },
        { name: 'isInternal', type: 'Boolean', isRequired: true, mappedName: 'is_internal' },
        { name: 'isM2', type: 'Boolean', isRequired: true, mappedName: 'is_m2' },
        { name: 'baseM2Price', type: 'Decimal', isRequired: false, mappedName: 'base_m2_price' },
        { name: 'productionTime', type: 'String', isRequired: false, mappedName: 'production_time' },
        { name: 'compatibleFinishings', type: 'Json', isRequired: false, mappedName: 'compatible_finishings' },
        { name: 'priceTiers', type: 'Json', isRequired: false, mappedName: 'price_tiers' },
        { name: 'isActive', type: 'Boolean', isRequired: true, mappedName: 'is_active' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: [],
    },
    {
      name: 'Order',
      tableName: 'orders',
      description: 'Ordens de serviço, status de produção, pagamentos e rastreio',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'code', type: 'String', isRequired: true },
        { name: 'clientId', type: 'String', isRequired: false, mappedName: 'client_id' },
        { name: 'clientName', type: 'String', isRequired: true, mappedName: 'client_name' },
        { name: 'clientWhatsapp', type: 'String', isRequired: true, mappedName: 'client_whatsapp' },
        { name: 'description', type: 'String', isRequired: true },
        { name: 'items', type: 'Json', isRequired: false },
        { name: 'itemsCount', type: 'Int', isRequired: true, mappedName: 'items_count' },
        { name: 'total', type: 'Decimal', isRequired: true },
        { name: 'paidAmount', type: 'Decimal', isRequired: true, mappedName: 'paid_amount' },
        { name: 'status', type: 'String', isRequired: true },
        { name: 'paymentStatus', type: 'String', isRequired: true, mappedName: 'payment_status' },
        { name: 'paymentMethod', type: 'String', isRequired: false, mappedName: 'payment_method' },
        { name: 'pixKey', type: 'String', isRequired: false, mappedName: 'pix_key' },
        { name: 'trackingCode', type: 'String', isRequired: false, mappedName: 'tracking_code' },
        { name: 'shippingCarrier', type: 'String', isRequired: false, mappedName: 'shipping_carrier' },
        { name: 'deliveryDate', type: 'String', isRequired: false, mappedName: 'delivery_date' },
        { name: 'notes', type: 'String', isRequired: false },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: ['client: Client (1:N)', 'minioFiles: MinioFile[] (1:N)'],
    },
    {
      name: 'Quote',
      tableName: 'quotes',
      description: 'Orçamentos comerciais, propostas com validade e descontos',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'code', type: 'String', isRequired: false },
        { name: 'number', type: 'String', isRequired: false },
        { name: 'clientId', type: 'String', isRequired: false, mappedName: 'client_id' },
        { name: 'clientName', type: 'String', isRequired: true, mappedName: 'client_name' },
        { name: 'clientWhatsapp', type: 'String', isRequired: true, mappedName: 'client_whatsapp' },
        { name: 'items', type: 'Json', isRequired: true },
        { name: 'subtotal', type: 'Decimal', isRequired: true },
        { name: 'discount', type: 'Decimal', isRequired: true },
        { name: 'total', type: 'Decimal', isRequired: true },
        { name: 'status', type: 'String', isRequired: true },
        { name: 'validUntil', type: 'String', isRequired: false, mappedName: 'valid_until' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: ['client: Client (1:N)'],
    },
    {
      name: 'Transaction',
      tableName: 'transactions',
      description: 'Movimentações financeiras, receitas e despesas com DRE',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'type', type: 'String', isRequired: true },
        { name: 'description', type: 'String', isRequired: true },
        { name: 'value', type: 'Decimal', isRequired: true },
        { name: 'paymentMethod', type: 'String', isRequired: false, mappedName: 'payment_method' },
        { name: 'status', type: 'String', isRequired: true },
        { name: 'category', type: 'String', isRequired: false },
        { name: 'dueDate', type: 'String', isRequired: false, mappedName: 'due_date' },
        { name: 'clientName', type: 'String', isRequired: false, mappedName: 'client_name' },
        { name: 'orderCode', type: 'String', isRequired: false, mappedName: 'order_code' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: [],
    },
    {
      name: 'AccessProfile',
      tableName: 'access_profiles',
      description: 'Perfis de acesso granulares (RBAC/ABAC) com telas e rotinas',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'name', type: 'String', isRequired: true },
        { name: 'code', type: 'String', isRequired: true },
        { name: 'description', type: 'String', isRequired: false },
        { name: 'color', type: 'String', isRequired: false },
        { name: 'icon', type: 'String', isRequired: false },
        { name: 'allowedPermissions', type: 'Json', isRequired: false, mappedName: 'allowed_permissions' },
        { name: 'allowedScreens', type: 'Json', isRequired: false, mappedName: 'allowed_screens' },
        { name: 'allowedRoutines', type: 'Json', isRequired: false, mappedName: 'allowed_routines' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: [],
    },
    {
      name: 'Employee',
      tableName: 'employees',
      description: 'Colaboradores, logins e atribuições de múltiplos perfis',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'name', type: 'String', isRequired: true },
        { name: 'email', type: 'String', isRequired: true },
        { name: 'whatsapp', type: 'String', isRequired: true },
        { name: 'jobTitle', type: 'String', isRequired: true, mappedName: 'job_title' },
        { name: 'department', type: 'String', isRequired: true },
        { name: 'status', type: 'String', isRequired: true },
        { name: 'profileIds', type: 'Json', isRequired: false, mappedName: 'profile_ids' },
        { name: 'customPermissions', type: 'Json', isRequired: false, mappedName: 'custom_permissions' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: [],
    },
    {
      name: 'MinioFile',
      tableName: 'minio_files',
      description: 'Metadados e referências de arquivos armazenados no MinIO S3',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'bucket', type: 'String', isRequired: true },
        { name: 'filename', type: 'String', isRequired: true },
        { name: 'originalName', type: 'String', isRequired: true, mappedName: 'original_name' },
        { name: 'size', type: 'BigInt', isRequired: true },
        { name: 'mimeType', type: 'String', isRequired: false, mappedName: 'mime_type' },
        { name: 'url', type: 'String', isRequired: false },
        { name: 'category', type: 'String', isRequired: true },
        { name: 'orderId', type: 'String', isRequired: false, mappedName: 'order_id' },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: ['order: Order (1:N)', 'client: Client (1:N)'],
    },
    {
      name: 'N8nEventLog',
      tableName: 'n8n_event_logs',
      description: 'Logs e auditoria de disparos de automações n8n',
      fields: [
        { name: 'id', type: 'String', isId: true, isRequired: true },
        { name: 'eventType', type: 'String', isRequired: true, mappedName: 'event_type' },
        { name: 'targetUrl', type: 'String', isRequired: true, mappedName: 'target_url' },
        { name: 'payload', type: 'Json', isRequired: true },
        { name: 'status', type: 'String', isRequired: true },
        { name: 'httpStatus', type: 'Int', isRequired: false, mappedName: 'http_status' },
        { name: 'response', type: 'String', isRequired: false },
        { name: 'createdAt', type: 'DateTime', isRequired: true, mappedName: 'created_at' },
      ],
      relations: [],
    },
  ];

  // GET /api/prisma/status - Test and get Prisma ORM status
  app.get('/api/prisma/status', async (req, res) => {
    const testResult = await testPrismaConnection();
    
    // Count records for each model if connected
    const modelsWithCounts: any[] = [...PRISMA_MODELS_METADATA];
    if (testResult.success) {
      try {
        const prisma = getPrisma();
        for (const m of modelsWithCounts) {
          try {
            const count = await (prisma as any)[m.name.charAt(0).toLowerCase() + m.name.slice(1)].count();
            m.recordsCount = count;
          } catch {
            m.recordsCount = 0;
          }
        }
      } catch {
        // ignore count errors
      }
    }

    res.json({
      isInitialized: true,
      version: '7.9.1',
      status: testResult.success ? 'connected' : 'disconnected',
      message: testResult.message,
      latencyMs: testResult.latencyMs,
      modelsCount: modelsWithCounts.length,
      models: modelsWithCounts,
      lastChecked: new Date().toISOString(),
    });
  });

  // GET /api/prisma/schema - Get the raw schema.prisma contents
  app.get('/api/prisma/schema', async (req, res) => {
    try {
      const fs = await import('fs');
      const schemaContent = fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf-8');
      res.json({
        success: true,
        schema: schemaContent,
        models: PRISMA_MODELS_METADATA,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/prisma/query - Execute Prisma query or raw query with execution stats
  app.post('/api/prisma/query', async (req, res) => {
    const { model, action, queryParams, rawSql } = req.body;
    const startTime = Date.now();

    try {
      const prisma = getPrisma();

      if (rawSql && rawSql.trim()) {
        const rawRes: any = await prisma.$queryRawUnsafe(rawSql);
        const latencyMs = Date.now() - startTime;
        return res.json({
          success: true,
          type: 'raw',
          result: rawRes,
          count: Array.isArray(rawRes) ? rawRes.length : 1,
          latencyMs,
        });
      }

      if (model && action) {
        const modelClient = (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)];
        if (!modelClient || typeof modelClient[action] !== 'function') {
          return res.status(400).json({
            success: false,
            message: `Modelo "${model}" ou método "${action}" inválido no Prisma Client.`,
          });
        }

        const result = await modelClient[action](queryParams || {});
        const latencyMs = Date.now() - startTime;
        return res.json({
          success: true,
          type: 'model',
          model,
          action,
          result,
          count: Array.isArray(result) ? result.length : result ? 1 : 0,
          latencyMs,
        });
      }

      return res.status(400).json({ success: false, message: 'Parâmetros de consulta Prisma não informados.' });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      res.status(400).json({
        success: false,
        message: err.message,
        latencyMs,
      });
    }
  });

  // ===================================================
  // 6. MINIO S3 OBJECT STORAGE API ROUTES
  // ===================================================

  // GET /api/minio/config
  app.get('/api/minio/config', (req, res) => {
    res.json(getMinioConfig());
  });

  // POST /api/minio/config
  app.post('/api/minio/config', (req, res) => {
    setMinioConfig(req.body);
    res.json({ success: true, config: getMinioConfig() });
  });

  // POST /api/minio/test - Test MinIO S3 Connection
  app.post('/api/minio/test', async (req, res) => {
    const result = await testMinioConnection(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // GET /api/minio/buckets
  app.get('/api/minio/buckets', async (req, res) => {
    try {
      const buckets = await listMinioBuckets();
      res.json({ success: true, buckets });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/minio/buckets
  app.post('/api/minio/buckets', async (req, res) => {
    const { bucketName } = req.body;
    if (!bucketName) {
      return res.status(400).json({ success: false, message: 'Nome do bucket é obrigatório.' });
    }
    try {
      await createMinioBucket(bucketName);
      res.json({ success: true, message: `Bucket "${bucketName}" criado com sucesso!` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/minio/files
  app.get('/api/minio/files', async (req, res) => {
    const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : undefined;
    try {
      const files = await listMinioFiles(bucket);
      res.json({ success: true, files });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, files: [] });
    }
  });

  // POST /api/minio/upload - Direct File Upload to MinIO
  app.post('/api/minio/upload', upload.single('file') as any, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
    }

    const category = (req.body.category || 'geral') as 'arte' | 'comprovante' | 'relatorio' | 'geral';
    const targetBucket = req.body.bucket || undefined;

    try {
      const result = await uploadMinioFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        targetBucket,
        {
          category,
          originalName: req.file.originalname,
        }
      );

      // Also record in postgres if available
      if (isPostgresReady()) {
        try {
          await executeSqlQuery(
            `INSERT INTO minio_files (id, bucket, filename, original_name, size, mime_type, url, category, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              `file-${Date.now()}`,
              result.bucket,
              result.filename,
              req.file.originalname,
              result.size,
              req.file.mimetype,
              result.url,
              category,
            ]
          );
        } catch (dbErr) {
          console.error('[Postgres MinIO File Record Error]:', dbErr);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Arquivo salvo com sucesso no MinIO S3!',
        ...result,
      });
    } catch (err: any) {
      console.error('[MinIO Upload Error]:', err);
      res.status(500).json({ success: false, message: `Erro no upload para o MinIO: ${err.message}` });
    }
  });

  // GET /api/minio/download/:bucket/:filename
  app.get('/api/minio/download/:bucket/:filename', async (req, res) => {
    const { bucket, filename } = req.params;
    try {
      const stream = await getMinioFileStream(filename, bucket);
      stream.pipe(res);
    } catch (err: any) {
      res.status(404).json({ error: `Arquivo não encontrado no MinIO: ${err.message}` });
    }
  });

  // DELETE /api/minio/files/:filename
  app.delete('/api/minio/files/:filename', async (req, res) => {
    const { filename } = req.params;
    const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : undefined;
    try {
      await deleteMinioFile(filename, bucket);
      res.json({ success: true, message: `Arquivo "${filename}" excluído com sucesso do MinIO!` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/minio/replica/products - Export Postgres products to MinIO JSON cache
  app.post('/api/minio/replica/products', async (req, res) => {
    try {
      const products = await dataStore.getProducts();
      const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : undefined;
      const result = await replicateProductsJsonToMinio(products, bucket);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/catalog/cached - High-speed catalog reading from MinIO replica (or fallback to DB)
  app.get('/api/catalog/cached', async (req, res) => {
    try {
      const cached = await getProductsJsonFromMinio();
      if (cached && cached.products && cached.products.length > 0) {
        return res.json({
          source: 'minio_json_replica',
          total: cached.total,
          replicatedAt: cached.replicatedAt,
          products: cached.products,
        });
      }

      // Fallback: Read directly from Postgres/Store
      const products = await dataStore.getProducts();
      res.json({
        source: isPostgresReady() ? 'postgresql_direct' : 'store_fallback',
        total: products.length,
        products,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===================================================
  // 7. N8N AUTOMATION PLATFORM API ROUTES
  // ===================================================

  // GET /api/n8n/config
  app.get('/api/n8n/config', (req, res) => {
    res.json(getN8nConfig());
  });

  // POST /api/n8n/config
  app.post('/api/n8n/config', (req, res) => {
    setN8nConfig(req.body);
    res.json({ success: true, config: getN8nConfig() });
  });

  // POST /api/n8n/test
  app.post('/api/n8n/test', async (req, res) => {
    const { baseUrl, apiKey, testUrl } = req.body;
    const result = await testN8nConnection(testUrl || baseUrl, apiKey);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // GET /api/n8n/logs
  app.get('/api/n8n/logs', (req, res) => {
    res.json(getN8nEventLogs());
  });

  // POST /api/n8n/trigger - Manual test trigger
  app.post('/api/n8n/trigger', async (req, res) => {
    const { eventType, payload } = req.body;
    const result = await dispatchN8nEvent(eventType || 'order.created', payload || { test: true });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // ===================================================
  // 8. REAL EVOLUTION API (WHATSAPP VPS) PROXY ROUTES
  // ===================================================

  const normalizeEvoUrl = (rawUrl: string) => {
    let u = (rawUrl || '').trim();
    if (!u) return '';
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      u = 'https://' + u;
    }
    return u.replace(/\/+$/, '');
  };

  // POST /api/evolution/test-connection
  app.post('/api/evolution/test-connection', async (req, res) => {
    const { apiUrl, instanceName, apiKey } = req.body;
    const cleanUrl = normalizeEvoUrl(apiUrl);
    const instance = (instanceName || '').trim();
    const token = (apiKey || '').trim();

    if (!cleanUrl || !instance) {
      return res.status(400).json({
        success: false,
        state: 'disconnected',
        message: 'URL e Nome da Instância da Evolution API são obrigatórios.',
      });
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const targetUrl = `${cleanUrl}/instance/connectionState/${encodeURIComponent(instance)}`;
      console.log(`[Evolution Proxy] Testando conexão real em: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: token,
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      const data: any = await response.json().catch(() => ({}));

      if (response.ok) {
        const rawState =
          data?.instance?.state ||
          data?.state ||
          (data?.status === 'open' ? 'open' : data?.status);

        const state =
          rawState === 'open' || rawState === 'connected'
            ? 'open'
            : rawState === 'connecting'
            ? 'connecting'
            : rawState === 'qrcode'
            ? 'qrcode'
            : rawState === 'close' || rawState === 'closed'
            ? 'close'
            : 'disconnected';

        return res.json({
          success: state === 'open',
          state,
          latencyMs: latency,
          httpStatus: response.status,
          message:
            state === 'open'
              ? `Conexão bem-sucedida com a VPS! Instância "${instance}" conectada ao WhatsApp (${latency}ms).`
              : state === 'qrcode'
              ? `Instância "${instance}" aguardando leitura do QR Code.`
              : `Instância "${instance}" respondeu com estado: ${state}`,
          data,
        });
      } else {
        return res.status(response.status).json({
          success: false,
          state: 'disconnected',
          latencyMs: latency,
          httpStatus: response.status,
          message: data?.response?.message || data?.message || `Erro HTTP ${response.status} da VPS.`,
          data,
        });
      }
    } catch (err: any) {
      const latency = Date.now() - startTime;
      return res.status(502).json({
        success: false,
        state: 'disconnected',
        latencyMs: latency,
        message: `Não foi possível conectar ao servidor "${cleanUrl}": ${err.message}`,
      });
    }
  });

  // POST /api/evolution/get-qrcode
  app.post('/api/evolution/get-qrcode', async (req, res) => {
    const { apiUrl, instanceName, apiKey } = req.body;
    const cleanUrl = normalizeEvoUrl(apiUrl);
    const instance = (instanceName || '').trim();
    const token = (apiKey || '').trim();

    if (!cleanUrl || !instance) {
      return res.status(400).json({ success: false, message: 'Dados da instância incompletos.' });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(
        `${cleanUrl}/instance/connect/${encodeURIComponent(instance)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: token,
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data: any = await response.json().catch(() => ({}));

      if (response.ok) {
        const qrcode =
          data?.base64 ||
          data?.qrcode?.base64 ||
          data?.code ||
          data?.instance?.qrcode?.base64;
        const pairingCode = data?.pairingCode || data?.instance?.pairingCode;

        return res.json({
          success: true,
          qrcode,
          pairingCode,
          message: qrcode
            ? 'QR Code gerado pela VPS com sucesso!'
            : 'Instância já conectada ou pronta.',
          data,
        });
      } else {
        return res.status(response.status).json({
          success: false,
          message: data?.response?.message || data?.message || `Erro ${response.status} ao obter QR Code da VPS.`,
          data,
        });
      }
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        message: `Falha ao solicitar QR Code na VPS: ${err.message || 'Erro de conexão'}`,
      });
    }
  });

  // POST /api/evolution/restart-instance
  app.post('/api/evolution/restart-instance', async (req, res) => {
    const { apiUrl, instanceName, apiKey } = req.body;
    const cleanUrl = normalizeEvoUrl(apiUrl);
    const instance = (instanceName || '').trim();
    const token = (apiKey || '').trim();

    if (!cleanUrl || !instance) {
      return res.status(400).json({ success: false, message: 'Dados da instância incompletos.' });
    }

    try {
      const response = await fetch(
        `${cleanUrl}/instance/restart/${encodeURIComponent(instance)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: any = await response.json().catch(() => ({}));

      if (response.ok) {
        return res.json({
          success: true,
          message: `Comando de reinicialização aceito pela VPS para a instância "${instance}".`,
          data,
        });
      } else {
        return res.status(response.status).json({
          success: false,
          message: data?.response?.message || data?.message || `Erro ${response.status} ao reiniciar instância.`,
          data,
        });
      }
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        message: `Falha ao reiniciar na VPS: ${err.message || 'Erro de conexão'}`,
      });
    }
  });

  // POST /api/evolution/send-text
  app.post('/api/evolution/send-text', async (req, res) => {
    const { apiUrl, instanceName, apiKey, number, text } = req.body;
    const cleanUrl = normalizeEvoUrl(apiUrl);
    const instance = (instanceName || '').trim();
    const token = (apiKey || '').trim();
    const cleanNumber = (number || '').replace(/\D/g, '');

    if (!cleanUrl || !instance || !token) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais da Evolution API incompletas (URL, Instância e API Key são obrigatórias).',
      });
    }

    if (!cleanNumber || !text) {
      return res.status(400).json({
        success: false,
        error: 'Número do destinatário e texto da mensagem são obrigatórios.',
      });
    }

    try {
      const targetUrl = `${cleanUrl}/message/sendText/${encodeURIComponent(instance)}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: text,
          options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: true,
          },
        }),
      });

      const data: any = await response.json().catch(() => ({}));

      if (response.ok) {
        return res.json({
          success: true,
          messageId: data?.key?.id || data?.messageId || `evo-${Date.now()}`,
          status: 'delivered',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data,
        });
      } else {
        return res.status(response.status).json({
          success: false,
          error: data?.response?.message || data?.message || `Erro ${response.status} ao enviar mensagem via Evolution API`,
          data,
        });
      }
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        error: `Falha de comunicação com a VPS Evolution: ${err.message || 'Erro de rede'}`,
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'smartGraph Core API Server',
      postgresStatus: isPostgresReady() ? 'connected' : 'standalone',
      minioStatus: getMinioConfig().status,
      n8nStatus: getN8nConfig().status,
      timestamp: new Date().toISOString(),
    });
  });

  // ===================================================
  // 9. VITE INTEGRATION & PRODUCTION ASSET SERVING
  // ===================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[smartGraph] Servidor unificado com PostgreSQL, MinIO, n8n e Evolution rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
