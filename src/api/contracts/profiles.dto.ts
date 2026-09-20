// ============================================================================
// DTOs & Contracts: Access Profiles & RBAC Permissions
// NestJS Controller: @Controller('profiles') / @Controller('permissions')
// ============================================================================

export interface CreateProfileDto {
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  isSystemDefault?: boolean;
  allowedPermissions: string[]; // e.g. ['customers.view', 'orders.create', 'quotes.approve']
  allowedScreens: string[];     // Screen IDs e.g. ['visao-geral', 'pedidos', 'financeiro']
  allowedRoutines: string[];    // Routine codes e.g. ['orders.update_status', 'clients.export']
}

export interface UpdateProfileDto {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  allowedPermissions?: string[];
  allowedScreens?: string[];
  allowedRoutines?: string[];
}

export interface ProfileResponseDto {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  isSystemDefault?: boolean;
  allowedPermissions: string[];
  allowedScreens: string[];
  allowedRoutines: string[];
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionDefinitionDto {
  resource: string;
  name: string;
  category: string;
  description: string;
  route: string;
  actions: {
    action: string;
    code: string;
    description: string;
    danger: 'low' | 'medium' | 'high' | 'critical';
  }[];
}
