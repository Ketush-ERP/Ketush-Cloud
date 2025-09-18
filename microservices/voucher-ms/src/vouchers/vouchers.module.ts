import { Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller';
import { NatsModule } from 'src/transports/nats.module';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [NatsModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
