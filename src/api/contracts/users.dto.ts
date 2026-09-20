// ============================================================================
// DTOs & Contracts: Users & Employees
// NestJS Controller: @Controller('users') / @Controller('employees')
// ============================================================================

export type UserDepartment =
  | 'Diretoria'
  | 'Comercial'
  | 'Arte & Pré-Impressão'
  | 'Produção'
  | 'Acabamento'
  | 'Logística'
  | 'Financeiro';

export type UserStatus = 'Ativo' | 'Pendente' | 'Bloqueado';

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  whatsapp: string;
  avatar?: string;
  jobTitle: string;
  department: UserDepartment;
  status: UserStatus;
  profileIds: string[];
  customPermissions?: {
    permissionId: string;
    permissionType: 'screen' | 'routine' | 'action';
    permissionName: string;
    grantType: 'allow' | 'deny';
    expiresAt?: string | null;
    reason?: string;
  }[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  whatsapp?: string;
  avatar?: string;
  jobTitle?: string;
  department?: UserDepartment;
  status?: UserStatus;
  profileIds?: string[];
}

export interface UserQueryDto {
  search?: string;
  department?: UserDepartment;
  status?: UserStatus;
  profileId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface AssignProfilesDto {
  profileIds: string[];
}

export interface GrantCustomPermissionDto {
  permissionId: string;
  permissionType: 'screen' | 'routine' | 'action';
  permissionName: string;
  grantType: 'allow' | 'deny';
  expiresAt?: string | null;
  reason?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar?: string;
  jobTitle: string;
  department: UserDepartment;
  status: UserStatus;
  profileIds: string[];
  isMaster?: boolean;
  customPermissions: {
    id: string;
    permissionId: string;
    permissionType: 'screen' | 'routine' | 'action';
    permissionName: string;
    grantType: 'allow' | 'deny';
    expiresAt: string | null;
    grantedAt: string;
    grantedBy: string;
    reason: string;
  }[];
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}
