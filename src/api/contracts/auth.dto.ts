// ============================================================================
// DTOs & Contracts: Authentication & Sessions
// NestJS Controller: @Controller('auth')
// ============================================================================

export interface LoginDto {
  /** Email do usuário cadastrado */
  email: string;
  /** Senha em texto puro (o NestJS deve validar com bcrypt/argon2) */
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
  jobTitle?: string;
  department?: string;
  profileIds?: string[];
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthUserResponseDto {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  avatar?: string;
  jobTitle: string;
  department: string;
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  profileIds: string[];
  profiles?: {
    id: string;
    name: string;
    code: string;
    allowedPermissions: string[];
    allowedScreens: string[];
    allowedRoutines: string[];
  }[];
  customPermissions?: {
    id: string;
    permissionId: string;
    permissionType: 'screen' | 'routine' | 'action';
    permissionName: string;
    grantType: 'allow' | 'deny';
    expiresAt: string | null;
  }[];
  isMaster?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUserResponseDto;
}
