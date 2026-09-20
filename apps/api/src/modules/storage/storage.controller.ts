import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@ApiTags('Storage de Artes')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Obtém URL pré-assinada para upload direto de arquivos pesados ao MinIO/S3' })
  @ApiResponse({ status: 200, description: 'URL de upload gerada com sucesso' })
  async getPresignedUrl(@Body() body: { filename: string; contentType: string }) {
    return await this.storageService.getPresignedUploadUrl(body.filename, body.contentType || 'application/pdf');
  }

  @Get('download-url/:key')
  @ApiOperation({ summary: 'Obtém URL temporária para o impressor baixar a arte no ERP' })
  async getDownloadUrl(@Param('key') key: string) {
    const url = await this.storageService.getPresignedDownloadUrl(key);
    return { downloadUrl: url };
  }

  @Post('upload-direct')
  @ApiOperation({ summary: 'Upload de contingência de arquivo caso o S3 direto esteja indisponível' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDirect(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'Nenhum arquivo enviado.' };
    }
    const fileKey = `artes/${Date.now()}-${file.originalname}`;
    const url = await this.storageService.uploadBuffer(fileKey, file.buffer, file.mimetype);
    return {
      success: true,
      fileKey,
      url,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
