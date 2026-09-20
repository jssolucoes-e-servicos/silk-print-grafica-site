// ============================================================================
// Storage Service (Upload de Arquivos, Comprovantes e Artes)
// NestJS Controller: @Controller('storage') ou @Controller('files')
// ============================================================================

import { apiClient } from '../client';
import {
  FileCategory,
  FileResponseDto,
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  StorageStatsDto,
} from '../contracts/storage.dto';

export class StorageService {
  /**
   * POST /api/storage/upload (Multipart FormData)
   */
  public async uploadFile(
    file: File | Blob,
    category: FileCategory = 'geral',
    extra?: { orderId?: string; clientId?: string }
  ): Promise<FileResponseDto> {
    return apiClient.upload<FileResponseDto>('/storage/upload', file, 'file', {
      category,
      ...extra,
    });
  }

  /**
   * GET /api/storage/files
   */
  public async listFiles(category?: FileCategory, orderId?: string): Promise<FileResponseDto[]> {
    return apiClient.get<FileResponseDto[]>('/storage/files', { category, orderId });
  }

  /**
   * DELETE /api/storage/files/:id
   */
  public async deleteFile(id: string): Promise<boolean> {
    await apiClient.delete(`/storage/files/${id}`);
    return true;
  }

  /**
   * POST /api/storage/presigned-url
   * Gera URL pré-assinada para upload direto ao S3 / MinIO
   */
  public async getPresignedUrl(data: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    return apiClient.post<PresignedUrlResponseDto>('/storage/presigned-url', data);
  }

  /**
   * GET /api/storage/stats
   */
  public async getStats(): Promise<StorageStatsDto> {
    return apiClient.get<StorageStatsDto>('/storage/stats');
  }
}

export const storageService = new StorageService();
