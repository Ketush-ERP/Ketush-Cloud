import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CardController],
  providers: [CardService],
  imports: [NatsModule],
})
export class CardModule {}
