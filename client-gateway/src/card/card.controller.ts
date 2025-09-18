import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Controller('card')
export class CardController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  async create(@Body() createCardDto: CreateCardDto) {
    try {
      const createCard = await firstValueFrom(
        this.client.send({ cmd: 'create_card' }, createCardDto),
      );

      return createCard;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  async findAll() {
    try {
      const getAllCard = await firstValueFrom(
        this.client.send({ cmd: 'find_all_card' }, {}),
      );
      return getAllCard;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const getOneById = await firstValueFrom(
        this.client.send({ cmd: 'find_one_card' }, id),
      );

      return getOneById;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch('update/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    try {
      const updateCard = await firstValueFrom(
        this.client.send({ cmd: 'update_card' }, { id, ...updateCardDto }),
      );
      return updateCard;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
