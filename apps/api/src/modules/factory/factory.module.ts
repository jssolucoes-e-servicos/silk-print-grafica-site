import { Module } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { FactoryController } from './factory.controller';

@Module({
  controllers: [FactoryController],
  providers: [FactoryService],
  exports: [FactoryService],
})
export class FactoryModule {}
