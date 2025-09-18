import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [BankController],
})
export class BankModule {}
