// ============================================================================
// Profiles & Permissions Service (Perfis de Acesso RBAC)
// NestJS Controller: @Controller('profiles')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateProfileDto,
  UpdateProfileDto,
  ProfileResponseDto,
  PermissionDefinitionDto,
} from '../contracts/profiles.dto';

export class ProfilesService {
  /**
   * GET /api/profiles
   */
  public async getAll(): Promise<ProfileResponseDto[]> {
    return apiClient.get<ProfileResponseDto[]>('/profiles');
  }

  /**
   * GET /api/profiles/:id
   */
  public async getById(id: string): Promise<ProfileResponseDto> {
    return apiClient.get<ProfileResponseDto>(`/profiles/${id}`);
  }

  /**
   * POST /api/profiles
   */
  public async create(data: CreateProfileDto): Promise<ProfileResponseDto> {
    return apiClient.post<ProfileResponseDto>('/profiles', data);
  }

  /**
   * PUT /api/profiles/:id
   */
  public async update(id: string, data: UpdateProfileDto): Promise<ProfileResponseDto> {
    return apiClient.put<ProfileResponseDto>(`/profiles/${id}`, data);
  }

  /**
   * DELETE /api/profiles/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/profiles/${id}`);
    return true;
  }

  /**
   * GET /api/profiles/permissions/catalog
   * Retorna catálogo completo de recursos e ações RBAC disponíveis
   */
  public async getPermissionsCatalog(): Promise<PermissionDefinitionDto[]> {
    return apiClient.get<PermissionDefinitionDto[]>('/profiles/permissions/catalog');
  }
}

export const profilesService = new ProfilesService();
