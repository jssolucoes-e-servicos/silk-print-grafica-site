import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { StorageModule } from './modules/storage/storage.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PickupPointsModule } from './modules/pickup-points/pickup-points.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { FactoryModule } from './modules/factory/factory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    StorageModule,
    ProductsModule,
    OrdersModule,
    PickupPointsModule,
    QuotesModule,
    FactoryModule,
  ],
})
export class AppModule {}
