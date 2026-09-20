// ============================================================================
// DTOs & Contracts: Storage & S3 / MinIO Files
// NestJS Controller: @Controller('storage') ou @Controller('files')
// ============================================================================

export type FileCategory = 'arte' | 'comprovante' | 'relatorio' | 'geral' | 'avatar' | 'produto';

export interface FileResponseDto {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  url: string;
  bucket: string;
  etag?: string;
  orderId?: string;
  clientId?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface PresignedUrlRequestDto {
  fileName: string;
  contentType: string;
  category?: FileCategory;
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface StorageStatsDto {
  totalFiles: number;
  totalSizeBytes: number;
  bucketsCount: number;
}
