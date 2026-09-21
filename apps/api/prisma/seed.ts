import { getPrisma } from '../server/prisma';
import { hashPassword, MASTER_ADMIN_SEED } from '../server/auth';
import { INITIAL_ACCESS_PROFILES } from '../src/lib/permissionsEngine';

async function main() {
  const prisma = getPrisma();
  console.log('🌱 [Prisma Seed] Iniciando seed de produção mínima para o ERP SilkPrint...');

  // 1. Seed Access Profiles
  console.log('🔒 Cadastrando perfis de acesso do sistema...');
  for (const profile of INITIAL_ACCESS_PROFILES) {
    await prisma.accessProfile.upsert({
      where: { code: profile.code },
      update: {
        name: profile.name,
        description: profile.description,
        color: profile.color,
        icon: profile.icon,
        isSystemDefault: profile.isSystemDefault || false,
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
        isSystemDefault: profile.isSystemDefault || false,
        allowedPermissions: profile.allowedPermissions,
        allowedScreens: profile.allowedScreens,
        allowedRoutines: profile.allowedRoutines,
      },
    });
  }
  console.log(`✅ ${INITIAL_ACCESS_PROFILES.length} perfis de acesso criados/atualizados.`);

  // 2. Seed Master Admin User
  console.log('👑 Cadastrando usuário Administrador Master...');
  const { hash, salt } = hashPassword(MASTER_ADMIN_SEED.defaultPassword);

  const masterUser = await (prisma.employee as any).upsert({
    where: { email: MASTER_ADMIN_SEED.email },
    update: {
      name: MASTER_ADMIN_SEED.name,
      whatsapp: MASTER_ADMIN_SEED.whatsapp,
      jobTitle: MASTER_ADMIN_SEED.jobTitle,
      department: MASTER_ADMIN_SEED.department,
      status: MASTER_ADMIN_SEED.status,
      isMaster: true,
      profileIds: MASTER_ADMIN_SEED.profileIds,
      customPermissions: MASTER_ADMIN_SEED.customPermissions,
    },
    create: {
      id: MASTER_ADMIN_SEED.id,
      name: MASTER_ADMIN_SEED.name,
      email: MASTER_ADMIN_SEED.email,
      passwordHash: hash,
      salt: salt,
      whatsapp: MASTER_ADMIN_SEED.whatsapp,
      avatar: MASTER_ADMIN_SEED.avatar,
      jobTitle: MASTER_ADMIN_SEED.jobTitle,
      department: MASTER_ADMIN_SEED.department,
      status: MASTER_ADMIN_SEED.status,
      isMaster: true,
      profileIds: MASTER_ADMIN_SEED.profileIds,
      customPermissions: MASTER_ADMIN_SEED.customPermissions,
    },
  });

  console.log(`✅ Usuário Admin Master pronto para login: ${masterUser.email}`);
  console.log('🚀 Banco de dados limpo e preparado para início em produção (sem dados fictícios).');
}

main()
  .then(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed do Prisma:', e);
    const prisma = getPrisma();
    await prisma.$disconnect();
    process.exit(1);
  });
