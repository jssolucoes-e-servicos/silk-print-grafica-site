// ============================================================================
// Auth Service (Rotas de Autenticação)
// NestJS Controller: @Controller('auth')
// ============================================================================

import { apiClient } from '../client';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  AuthUserResponseDto,
  ChangePasswordDto,
} from '../contracts/auth.dto';

export class AuthService {
  /**
   * POST /api/auth/login
   * Realiza login e armazena o token JWT
   */
  public async login(data: LoginDto): Promise<AuthResponseDto> {
    const res = await apiClient.post<AuthResponseDto>('/auth/login', data);
    if (res && res.accessToken) {
      apiClient.setToken(res.accessToken, res.refreshToken);
    }
    return res;
  }

  /**
   * POST /api/auth/register
   * Cria novo usuário e autentica
   */
  public async register(data: RegisterDto): Promise<AuthResponseDto> {
    const res = await apiClient.post<AuthResponseDto>('/auth/register', data);
    if (res && res.accessToken) {
      apiClient.setToken(res.accessToken, res.refreshToken);
    }
    return res;
  }

  /**
   * GET /api/auth/me
   * Retorna perfil do usuário logado via Bearer token
   */
  public async getProfile(): Promise<AuthUserResponseDto> {
    return apiClient.get<AuthUserResponseDto>('/auth/me');
  }

  /**
   * POST /api/auth/change-password
   * Altera a senha do usuário logado
   */
  public async changePassword(data: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/auth/change-password', data);
  }

  /**
   * POST /api/auth/logout
   * Invalida a sessão e remove os tokens
   */
  public async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // continua mesmo se a rota falhar
    } finally {
      apiClient.clearTokens();
    }
  }
}

export const authService = new AuthService();
