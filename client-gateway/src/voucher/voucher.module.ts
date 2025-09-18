import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [VoucherController],
})
export class VoucherModule {}
