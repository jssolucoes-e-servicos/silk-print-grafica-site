import {
  SystemScreenDef,
  SystemRoutineDef,
  AccessProfile,
  UserEmployee,
  UserCustomPermission,
  ResourceDefinition,
  PermissionActionDef,
  StandardActionFlag,
} from '../types';
import resourcesData from '../data/resources.json';

export const SYSTEM_RESOURCES: ResourceDefinition[] = resourcesData.resources as ResourceDefinition[];
export const STANDARD_FLAGS = resourcesData.standardFlags;

// Flat list of all available permission codes (e.g. ['customers.view', 'customers.create', ...])
export const ALL_PERMISSION_CODES: string[] = SYSTEM_RESOURCES.flatMap((res) =>
  res.actions.map((act) => act.code)
);

// Map of route or legacy screen id to resource.view permission
export const ROUTE_TO_PERMISSION_MAP: Record<string, string> = {
  // Gestão routes
  'visao-geral': 'overview.view',
  'screen_visao_geral': 'overview.view',
  'pedidos': 'orders.view',
  'screen_pedidos': 'orders.view',
  'orcamentos': 'quotes.view',
  'screen_orcamentos': 'quotes.view',
  'clientes': 'customers.view',
  'screen_clientes': 'customers.view',
  'agenda': 'production.view',
  'screen_agenda': 'production.view',
  'pedidos-online': 'online_orders.view',
  'screen_pedidos_online': 'online_orders.view',
  'logistica': 'logistics.view',
  'screen_logistica': 'logistics.view',
  'produtos-internos': 'products.view',
  'screen_produtos_internos': 'products.view',

  // Admin routes
  'dashboard': 'dashboard.view',
  'screen_admin_dashboard': 'dashboard.view',
  'produtos': 'products.view',
  'screen_admin_produtos': 'products.view',
  'acabamentos': 'finishings.view',
  'screen_acabamentos': 'finishings.view',
  'financeiro': 'financial.view',
  'screen_financeiro': 'financial.view',
  'relatorios': 'reports.view',
  'screen_relatorios': 'reports.view',
  'funcionarios': 'users.view',
  'screen_funcionarios': 'users.view',
  'perfis': 'profiles.view',
  'screen_perfis_acesso': 'profiles.view',
  'configuracoes': 'settings.view',
  'screen_configuracoes': 'settings.view',
  'novo-orcamento': 'quotes.create',
  'novo-pedido': 'orders.create',
  'loja': 'overview.view',
};

// Legacy compatibility definitions
export const SYSTEM_SCREENS: SystemScreenDef[] = SYSTEM_RESOURCES.map((r) => ({
  id: `screen_${r.resource}`,
  name: r.name,
  category: r.category as any,
  description: r.description,
  iconName: r.resource === 'customers' ? 'Users' : r.resource === 'orders' ? 'Layers' : r.resource === 'financial' ? 'DollarSign' : 'Shield',
  route: r.route,
  mode: r.mode,
}));

export const SYSTEM_ROUTINES: SystemRoutineDef[] = SYSTEM_RESOURCES.flatMap((r) =>
  r.actions.map((act) => ({
    id: `rot_${act.code.replace('.', '_')}`,
    code: act.code,
    name: `${r.name} - ${act.action.toUpperCase()}`,
    category: r.category as any,
    description: act.description,
    dangerLevel: act.danger === 'critical' ? 'critico' : act.danger === 'high' ? 'alto' : act.danger === 'medium' ? 'medio' : 'baixo',
  }))
);

export const INITIAL_ACCESS_PROFILES: AccessProfile[] = [
  {
    id: 'prof_admin',
    name: 'Administrador Geral',
    code: 'ADMIN',
    description: 'Acesso irrestrito a todos os módulos, rotinas, endpoints da API e controle total de permissões.',
    color: '#3b82f6', // blue
    icon: 'ShieldAlert',
    isSystemDefault: true,
    allowedPermissions: [...ALL_PERMISSION_CODES, '*'],
    allowedScreens: SYSTEM_SCREENS.map((s) => s.id),
    allowedRoutines: ALL_PERMISSION_CODES,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z',
  },
  {
    id: 'prof_comercial',
    name: 'Comercial & Vendas',
    code: 'COMERCIAL',
    description: 'Emissão de orçamentos, pedidos de balcão, cadastro de clientes, catálogo e envio no WhatsApp.',
    color: '#10b981', // emerald
    icon: 'Briefcase',
    isSystemDefault: true,
    allowedPermissions: [
      'overview.view',
      'customers.view',
      'customers.create',
      'customers.edit',
      'customers.report',
      'quotes.view',
      'quotes.create',
      'quotes.edit',
      'quotes.approve',
      'quotes.report',
      'orders.view',
      'orders.create',
      'orders.edit',
      'orders.update_status',
      'online_orders.view',
      'online_orders.edit',
      'products.view',
      'finishings.view',
      'logistics.view',
      'logistics.create',
    ],
    allowedScreens: [
      'screen_overview',
      'screen_quotes',
      'screen_orders',
      'screen_customers',
      'screen_products',
      'screen_online_orders',
    ],
    allowedRoutines: [
      'orders.create',
      'orders.update_status',
      'quotes.create',
      'quotes.approve',
      'customers.create',
      'customers.edit',
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'prof_designer',
    name: 'Designer & Pré-Impressão',
    code: 'DESIGNER',
    description: 'Etapa de criação de arte, aprovação de gabaritos com clientes e acompanhamento de ordens.',
    color: '#ec4899', // pink
    icon: 'Palette',
    isSystemDefault: true,
    allowedPermissions: [
      'overview.view',
      'orders.view',
      'orders.edit',
      'orders.update_status',
      'production.view',
      'customers.view',
      'finishings.view',
      'online_orders.view',
      'online_orders.edit',
    ],
    allowedScreens: [
      'screen_overview',
      'screen_orders',
      'screen_production',
      'screen_customers',
      'screen_finishings',
    ],
    allowedRoutines: ['orders.update_status', 'customers.view'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
  },
  {
    id: 'prof_producao',
    name: 'Operador de Produção & Máquinas',
    code: 'PRODUCAO',
    description: 'Fila de impressão, etapas de produção em máquina, acabamentos e entrega no balcão.',
    color: '#8b5cf6', // purple
    icon: 'Printer',
    isSystemDefault: true,
    allowedPermissions: [
      'overview.view',
      'orders.view',
      'orders.update_status',
      'production.view',
      'production.edit',
      'finishings.view',
    ],
    allowedScreens: [
      'screen_overview',
      'screen_orders',
      'screen_production',
      'screen_finishings',
    ],
    allowedRoutines: ['orders.update_status', 'production.edit'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-10T16:00:00Z',
  },
  {
    id: 'prof_logistica',
    name: 'Logística & Expedição',
    code: 'LOGISTICA',
    description: 'Despacho de encomendas, emissão de Declaração de Conteúdo, conferência e código de rastreio.',
    color: '#f59e0b', // amber
    icon: 'Truck',
    isSystemDefault: true,
    allowedPermissions: [
      'overview.view',
      'orders.view',
      'orders.update_status',
      'logistics.view',
      'logistics.create',
      'logistics.edit',
      'logistics.report',
      'production.view',
    ],
    allowedScreens: [
      'screen_overview',
      'screen_orders',
      'screen_logistics',
      'screen_production',
    ],
    allowedRoutines: ['orders.update_status', 'logistics.create', 'logistics.edit'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-11T13:20:00Z',
  },
  {
    id: 'prof_financeiro',
    name: 'Financeiro & Controladoria',
    code: 'FINANCEIRO',
    description: 'Controle de pagamentos, conciliação de caixa, DRE gerencial, despesas e relatórios fiscais.',
    color: '#06b6d4', // cyan
    icon: 'BadgePercent',
    isSystemDefault: true,
    allowedPermissions: [
      'overview.view',
      'orders.view',
      'orders.payment_edit',
      'financial.view',
      'financial.create',
      'financial.edit',
      'financial.report',
      'financial.view_dre',
      'reports.view',
      'reports.report',
      'customers.view',
      'products.view',
    ],
    allowedScreens: [
      'screen_overview',
      'screen_orders',
      'screen_financial',
      'screen_reports',
      'screen_customers',
      'screen_products',
    ],
    allowedRoutines: [
      'orders.payment_edit',
      'financial.create',
      'financial.view_dre',
      'financial.report',
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
  },
];

export const INITIAL_EMPLOYEES: UserEmployee[] = [
  {
    id: 'emp-1',
    name: 'Carlos Oliveira (Admin Master)',
    email: 'admin@silkprint.com.br',
    whatsapp: '(11) 99123-4567',
    jobTitle: 'Diretor Geral & Administrador',
    department: 'Diretoria',
    status: 'Ativo',
    profileIds: ['prof_admin'],
    customPermissions: [],
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: 'Agora mesmo',
  },
];

// ==========================================
// ACCESS EVALUATION ENGINE (RBAC + ABAC)
// ==========================================

export interface AccessEvaluationResult {
  hasAccess: boolean;
  source: 'admin' | 'profile' | 'custom_permanent' | 'custom_temporary' | 'denied';
  reason: string;
  expiresAt?: string | null;
  isExpired?: boolean;
  matchingProfileNames: string[];
}

/**
 * Evaluates whether a user is allowed to execute a permission code (e.g. 'customers.create')
 * or access a screen/route.
 */
export function evaluateUserPermission(
  user: UserEmployee,
  permissionCodeOrRoute: string,
  profiles: AccessProfile[],
  type: 'screen' | 'routine' | 'action' = 'action'
): AccessEvaluationResult {
  // If user is blocked/inactive
  if (user.status === 'Bloqueado') {
    return {
      hasAccess: false,
      source: 'denied',
      reason: 'Usuário com acesso bloqueado no sistema.',
      matchingProfileNames: [],
    };
  }

  // Resolve target permission code from route or direct code
  const targetCode = ROUTE_TO_PERMISSION_MAP[permissionCodeOrRoute] || permissionCodeOrRoute;
  const [targetResource, targetAction] = targetCode.split('.');

  // 1. Check custom user direct permissions (HIGHEST PRIORITY OVERRIDE)
  const directGrant = user.customPermissions.find(
    (p) =>
      p.permissionId === targetCode ||
      p.permissionId === permissionCodeOrRoute ||
      p.permissionId === `${targetResource}.*`
  );

  if (directGrant) {
    if (directGrant.expiresAt) {
      const now = new Date().getTime();
      const exp = new Date(directGrant.expiresAt).getTime();
      const isExpired = now > exp;

      if (!isExpired) {
        return {
          hasAccess: directGrant.grantType === 'allow',
          source: 'custom_temporary',
          reason: `Permissão avulsa temporária concedida por ${directGrant.grantedBy} (${directGrant.reason || 'Sem motivo'}).`,
          expiresAt: directGrant.expiresAt,
          isExpired: false,
          matchingProfileNames: [],
        };
      }
    } else {
      return {
        hasAccess: directGrant.grantType === 'allow',
        source: 'custom_permanent',
        reason: `Permissão avulsa permanente concedida por ${directGrant.grantedBy} (${directGrant.reason || 'Sem motivo'}).`,
        expiresAt: null,
        isExpired: false,
        matchingProfileNames: [],
      };
    }
  }

  // 2. Resolve all assigned user profiles
  const userProfiles = profiles.filter((prof) => user.profileIds.includes(prof.id));

  // If user has Admin profile, always granted
  const isAdmin = userProfiles.some(
    (p) => p.code === 'ADMIN' || p.id === 'prof_admin' || p.allowedPermissions?.includes('*')
  );
  if (isAdmin) {
    return {
      hasAccess: true,
      source: 'admin',
      reason: 'Acesso total garantido pelo perfil Administrador Geral.',
      matchingProfileNames: userProfiles.map((p) => p.name),
    };
  }

  // Check if ANY profile allows this target permission
  const matchingProfiles: string[] = [];

  for (const prof of userProfiles) {
    const perms = prof.allowedPermissions || [];
    const routines = prof.allowedRoutines || [];
    const screens = prof.allowedScreens || [];

    const isExplicitAllowed =
      perms.includes(targetCode) ||
      perms.includes(`${targetResource}.*`) ||
      perms.includes('*') ||
      routines.includes(targetCode) ||
      routines.includes(permissionCodeOrRoute);

    // Fallback: If checking screen/view access
    const isScreenAllowed =
      (targetAction === 'view' || type === 'screen') &&
      (screens.includes(permissionCodeOrRoute) ||
        screens.includes(`screen_${targetResource}`) ||
        screens.includes(targetResource));

    if (isExplicitAllowed || isScreenAllowed) {
      matchingProfiles.push(prof.name);
    }
  }

  if (matchingProfiles.length > 0) {
    return {
      hasAccess: true,
      source: 'profile',
      reason: `Permitido pelos perfis: ${matchingProfiles.join(', ')}.`,
      matchingProfileNames: matchingProfiles,
    };
  }

  return {
    hasAccess: false,
    source: 'denied',
    reason: `Não autorizado para a ação '${targetCode}' nos perfis ativos deste usuário.`,
    matchingProfileNames: [],
  };
}

/**
 * Convenient boolean check: can(user, 'customers.create')
 */
export function can(
  user: UserEmployee | null | undefined,
  permissionCode: string,
  profiles: AccessProfile[] = INITIAL_ACCESS_PROFILES
): boolean {
  if (!user) return false;
  return evaluateUserPermission(user, permissionCode, profiles, 'action').hasAccess;
}

/**
 * Checks if user has all of the listed permissions
 */
export function canAll(
  user: UserEmployee | null | undefined,
  permissionCodes: string[],
  profiles: AccessProfile[] = INITIAL_ACCESS_PROFILES
): boolean {
  if (!user) return false;
  return permissionCodes.every((code) => can(user, code, profiles));
}

/**
 * Checks if user has at least one of the listed permissions
 */
export function canAny(
  user: UserEmployee | null | undefined,
  permissionCodes: string[],
  profiles: AccessProfile[] = INITIAL_ACCESS_PROFILES
): boolean {
  if (!user) return false;
  return permissionCodes.some((code) => can(user, code, profiles));
}

/**
 * Checks if user can access a screen route (e.g. 'clientes' -> 'customers.view')
 */
export function hasScreenPermission(
  user: UserEmployee,
  routeOrScreenId: string,
  profiles: AccessProfile[] = INITIAL_ACCESS_PROFILES
): boolean {
  return evaluateUserPermission(user, routeOrScreenId, profiles, 'screen').hasAccess;
}

/**
 * Gets all effective screens a user can view
 */
export function getEffectiveAllowedScreens(
  user: UserEmployee,
  profiles: AccessProfile[]
): string[] {
  const allowedSet = new Set<string>();

  for (const resource of SYSTEM_RESOURCES) {
    const res = evaluateUserPermission(user, `${resource.resource}.view`, profiles, 'action');
    if (res.hasAccess) {
      allowedSet.add(resource.route);
      allowedSet.add(`screen_${resource.resource}`);
      allowedSet.add(resource.resource);
    }
  }

  return Array.from(allowedSet);
}
