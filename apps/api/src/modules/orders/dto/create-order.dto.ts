import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '11988887777' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  document: string;
}

export class ShippingDto {
  @ApiProperty({ example: 'balcao' })
  @IsString()
  type: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'balcao_sp_centro', required: false })
  @IsOptional()
  @IsString()
  balcaoId?: string;

  @ApiProperty({ example: 'Balcão Sé - Centro SP', required: false })
  @IsOptional()
  @IsString()
  balcaoName?: string;

  @IsOptional()
  address?: any;
}

export class CreateOrderDto {
  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ type: ShippingDto })
  @ValidateNested()
  @Type(() => ShippingDto)
  shipping: ShippingDto;

  @ApiProperty({ example: [] })
  @IsArray()
  items: any[];

  @ApiProperty({ example: { method: 'pix', subtotal: 150, discount: 0, shippingCost: 0, total: 150 } })
  payment: {
    method: 'pix' | 'credit' | 'boleto';
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    installments?: number;
    token?: string;
  };

  @IsOptional()
  couponApplied?: string;
}
