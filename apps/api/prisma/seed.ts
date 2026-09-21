import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

const DEFAULT_PROFILES = [
  {
    id: 'prof-super-admin',
    name: 'Super Administrador',
    code: 'SUPER_ADMIN',
    description: 'Acesso irrestrito a todas as funções, configurações e dados',
    color: '#06b6d4',
    icon: 'ShieldAlert',
    isSystemDefault: true,
    allowedPermissions: ['*'],
    allowedScreens: ['*'],
    allowedRoutines: ['*'],
  },
  {
    id: 'prof-pcp-fabrica',
    name: 'Operador PCP & Produção',
    code: 'PCP_OPERATOR',
    description: 'Gestão da esteira de produção gráfica, Kanban e expedição',
    color: '#3b82f6',
    icon: 'Layers',
    isSystemDefault: true,
    allowedPermissions: ['ORDERS_VIEW', 'ORDERS_STATUS_UPDATE', 'FACTORY_KANBAN'],
    allowedScreens: ['kanban', 'expedicao'],
    allowedRoutines: ['UPDATE_STATUS', 'PRINT_TAGS'],
  },
];

async function main() {
  const prisma = new PrismaClient();
  console.log('🌱 [Prisma Seed] Iniciando seed de produção mínima para o ERP SilkPrint...');

  for (const profile of DEFAULT_PROFILES) {
    await prisma.accessProfile.upsert({
      where: { code: profile.code },
      update: {
        name: profile.name,
        description: profile.description,
        color: profile.color,
        icon: profile.icon,
        isSystemDefault: profile.isSystemDefault,
        allowedPermissions: profile.allowedPermissions,
        allowedScreens: profile.allowedScreens,
        allowedRoutines: profile.allowedRoutines,
      },
      create: {
        id: profile.id,
        name: profile.name,
        code: profile.code,
        description: profile.description,
        color: profile.color,
        icon: profile.icon,
        isSystemDefault: profile.isSystemDefault,
        allowedPermissions: profile.allowedPermissions,
        allowedScreens: profile.allowedScreens,
        allowedRoutines: profile.allowedRoutines,
      },
    });
  }
  console.log(`✅ Perfis de acesso criados/atualizados.`);

  const { hash, salt } = hashPassword('silkprint@admin2026');

  const masterUser = await (prisma.employee as any).upsert({
    where: { email: 'silkprintgrafica@gmail.com' },
    update: {
      name: 'Administrador Silk Print',
      whatsapp: '5551936187210',
      jobTitle: 'Diretor Geral',
      department: 'Diretoria Executiva',
      status: 'active',
      isMaster: true,
    },
    create: {
      id: 'emp-master-001',
      name: 'Administrador Silk Print',
      email: 'silkprintgrafica@gmail.com',
      passwordHash: hash,
      salt: salt,
      whatsapp: '5551936187210',
      jobTitle: 'Diretor Geral',
      department: 'Diretoria Executiva',
      status: 'active',
      isMaster: true,
      profileIds: ['prof-super-admin'],
      customPermissions: ['*'],
    },
  });

  console.log(`✅ Usuário Admin Master pronto para login: ${masterUser.email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erro no seed:', e);
  process.exit(1);
});
