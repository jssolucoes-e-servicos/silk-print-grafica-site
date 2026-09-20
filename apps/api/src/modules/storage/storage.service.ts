import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client | null = null;
  private bucketName = 'silkprint-documents';
  private isConfigured = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const port = Number(this.configService.get<string>('MINIO_PORT')) || 443;
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') !== 'false';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'silkprint-documents';

    if (!endpoint || !accessKey || !secretKey) {
      this.logger.warn('Credenciais MinIO/S3 incompletas. Storage em modo local simulado.');
      return;
    }

    try {
      this.minioClient = new Minio.Client({
        endPoint: endpoint.replace(/^https?:\/\//, ''),
        port,
        useSSL,
        accessKey,
        secretKey,
      });

      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} criado com sucesso.`);
      }
      this.isConfigured = true;
      this.logger.log(` MinIO S3 conectado com sucesso ao bucket "${this.bucketName}".`);
    } catch (err: any) {
      this.logger.error(` Falha ao inicializar MinIO: ${err?.message}`);
    }
  }

  /**
   * Gera uma URL pré-assinada para que o navegador do cliente envie o arquivo
   * pesado (PDF de 50MB a 300MB) DIRETO para o MinIO sem sobrecarregar o Node.js.
   */
  async getPresignedUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileKey = `artes/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    if (!this.minioClient || !this.isConfigured) {
      return {
        uploadUrl: `/api/storage/upload-direct?key=${encodeURIComponent(fileKey)}`,
        fileKey,
      };
    }

    const uploadUrl = await this.minioClient.presignedPutObject(this.bucketName, fileKey, 60 * 30); // 30 minutos
    return { uploadUrl, fileKey };
  }

  /**
   * Gera URL pré-assinada de download seguro para o operador da gráfica no ERP
   */
  async getPresignedDownloadUrl(fileKey: string): Promise<string> {
    if (!this.minioClient || !this.isConfigured) {
      return `/api/storage/files/${fileKey}`;
    }
    return await this.minioClient.presignedGetObject(this.bucketName, fileKey, 60 * 60 * 24); // 24 horas
  }

  /**
   * Upload direto via buffer
   */
  async uploadBuffer(fileKey: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.minioClient || !this.isConfigured) {
      this.logger.log(`Upload em memória simulado: ${fileKey}`);
      return `/uploads/${fileKey}`;
    }

    await this.minioClient.putObject(this.bucketName, fileKey, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    return await this.getPresignedDownloadUrl(fileKey);
  }
}
