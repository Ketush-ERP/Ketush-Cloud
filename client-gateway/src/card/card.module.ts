import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [CardController],
})
export class CardModule {}
