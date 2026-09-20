import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FactoryService } from './factory.service';

@ApiTags('Fábrica & PCP')
@Controller('factory')
export class FactoryController {
  constructor(private readonly factoryService: FactoryService) {}

  @Get('raw-materials')
  @ApiOperation({ summary: 'Lista estoque de matérias-primas e insumos (papéis, chapas, tintas)' })
  @ApiResponse({ status: 200, description: 'Estoque de almoxarifado' })
  async getRawMaterials() {
    const list = await this.factoryService.getRawMaterials();
    return { success: true, data: list };
  }

  @Patch('raw-materials/:id/stock')
  @ApiOperation({ summary: 'Ajusta quantidade em estoque de matéria-prima (entrada ou baixa)' })
  async updateStock(@Param('id') id: string, @Body() body: { delta: number }) {
    const updated = await this.factoryService.updateRawMaterialStock(id, body.delta);
    return { success: true, data: updated };
  }

  @Post('calculate-budget')
  @ApiOperation({ summary: 'Simulador de cálculo gráfico com aproveitamento de folha e chapas CTP' })
  calculateBudget(@Body() body: any) {
    const result = this.factoryService.calculateGraphicBudget(body);
    return { success: true, data: result };
  }
}
