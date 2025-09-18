import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller()
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @MessagePattern({ cmd: 'create_card' })
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @MessagePattern({ cmd: 'find_all_card' })
  findAll() {
    return this.cardService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_card' })
  findOne(@Payload() id: string) {
    return this.cardService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_card' })
  update(@Payload() updateCardDto: UpdateCardDto) {
    return this.cardService.update(updateCardDto.id, updateCardDto);
  }
}
