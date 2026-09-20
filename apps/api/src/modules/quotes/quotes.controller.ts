import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';

@ApiTags('Orçamentos & Leads')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Envia solicitação de orçamento personalizado do cliente' })
  @ApiResponse({ status: 201, description: 'Orçamento recebido e despachado para WhatsApp e n8n' })
  async create(@Body() body: any) {
    const quote = await this.quotesService.submitQuoteRequest(body);
    return { success: true, data: quote };
  }

  @Get()
  @ApiOperation({ summary: 'Lista orçamentos recebidos para o setor comercial do ERP' })
  async getAll() {
    const list = await this.quotesService.getAll();
    return { success: true, data: list };
  }
}
