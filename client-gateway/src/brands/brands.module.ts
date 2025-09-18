import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [BrandsController],
})
export class BrandsModule {}
