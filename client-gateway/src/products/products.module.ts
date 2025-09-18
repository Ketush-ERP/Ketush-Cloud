import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { NatsModule } from 'src/transports/nats.module';
import { ProductParserService } from './utils';

@Module({
  imports: [NatsModule],
  controllers: [ProductsController],
  providers: [ProductParserService],
})
export class ProductsModule {}
