import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Catálogo & Produtos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista catálogo completo de produtos e categorias para a loja virtual' })
  @ApiResponse({ status: 200, description: 'Catálogo retornado com sucesso' })
  async getCatalog() {
    return await this.productsService.getCatalog();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtém detalhes e opções de configuração de um produto pelo slug' })
  async getProductBySlug(@Param('slug') slug: string) {
    return await this.productsService.getProductBySlug(slug);
  }
}
