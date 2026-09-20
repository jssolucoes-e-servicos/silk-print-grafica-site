import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PickupPointsService } from './pickup-points.service';

@ApiTags('Balcões de Retirada')
@Controller('pickup-points')
export class PickupPointsController {
  constructor(private readonly pickupPointsService: PickupPointsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista balcões de retirada com filtros por estado e busca' })
  @ApiResponse({ status: 200, description: 'Lista de balcões retornada com sucesso' })
  async getAll(
    @Query('state') state?: string,
    @Query('search') search?: string,
  ) {
    const list = await this.pickupPointsService.getAll({ state, search });
    return { success: true, data: list };
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra ou atualiza um balcão de retirada' })
  async save(@Body() body: any) {
    const saved = await this.pickupPointsService.save(body);
    return { success: true, data: saved };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um balcão de retirada permanentemente' })
  async delete(@Param('id') id: string) {
    await this.pickupPointsService.delete(id);
    return { success: true };
  }
}
