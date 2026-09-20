import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Pedidos & Checkout')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido com geração de Pix / cobrança Mercado Pago' })
  @ApiResponse({ status: 201, description: 'Pedido criado com QR Code Pix gerado' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(createOrderDto);
    return { success: true, data: order };
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos para o painel ERP' })
  async getAll() {
    const orders = await this.ordersService.getAllOrders();
    return { success: true, data: orders };
  }

  @Get('track/:id')
  @ApiOperation({ summary: 'Rastreamento público de pedido para o cliente final' })
  async track(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      return { success: false, message: 'Pedido não encontrado.' };
    }
    return { success: true, data: order };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status da O.S. no Kanban do ERP' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const updated = await this.ordersService.updateOrderStatus(id, body.status, body.notes);
    if (!updated) {
      return { success: false, message: 'Pedido não encontrado.' };
    }
    return { success: true, data: updated };
  }

  @Post('webhook/mercadopago')
  @ApiOperation({ summary: 'Webhook de notificação de pagamento do Mercado Pago' })
  async handleWebhook(@Query() query: any, @Body() body: any) {
    // Processamento do webhook Mercado Pago
    return { received: true };
  }
}
