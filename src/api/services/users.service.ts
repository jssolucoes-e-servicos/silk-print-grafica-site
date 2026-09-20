// ============================================================================
// Users & Employees Service (Colaboradores e Usuários)
// NestJS Controller: @Controller('users') ou @Controller('employees')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  AssignProfilesDto,
  GrantCustomPermissionDto,
} from '../contracts/users.dto';

export class UsersService {
  /**
   * GET /api/users
   */
  public async getAll(query?: UserQueryDto): Promise<UserResponseDto[]> {
    return apiClient.get<UserResponseDto[]>('/users', query);
  }

  /**
   * GET /api/users/:id
   */
  public async getById(id: string): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(`/users/${id}`);
  }

  /**
   * POST /api/users
   */
  public async create(data: CreateUserDto): Promise<UserResponseDto> {
    return apiClient.post<UserResponseDto>('/users', data);
  }

  /**
   * PUT /api/users/:id
   */
  public async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>(`/users/${id}`, data);
  }

  /**
   * DELETE /api/users/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/users/${id}`);
    return true;
  }

  /**
   * PUT /api/users/:id/profiles
   */
  public async assignProfiles(id: string, data: AssignProfilesDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>(`/users/${id}/profiles`, data);
  }

  /**
   * POST /api/users/:id/custom-permissions
   */
  public async grantCustomPermission(
    id: string,
    data: GrantCustomPermissionDto
  ): Promise<UserResponseDto> {
    return apiClient.post<UserResponseDto>(`/users/${id}/custom-permissions`, data);
  }

  /**
   * DELETE /api/users/:id/custom-permissions/:permissionId
   */
  public async revokeCustomPermission(
    id: string,
    permissionId: string
  ): Promise<UserResponseDto> {
    return apiClient.delete<UserResponseDto>(`/users/${id}/custom-permissions/${permissionId}`);
  }
}

export const usersService = new UsersService();
