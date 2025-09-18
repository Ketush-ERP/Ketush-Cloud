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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { CreateBankDto } from './dto/create-back.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('bank')
export class BankController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  async create(@Body() createBankDto: CreateBankDto) {
    try {
      const createBank = await firstValueFrom(
        this.client.send({ cmd: 'create_bank' }, createBankDto),
      );

      return createBank;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  async findAll() {
    try {
      const getAllBank = await firstValueFrom(
        this.client.send({ cmd: 'find_all_banks' }, {}),
      );
      return getAllBank;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const getOneById = await firstValueFrom(
        this.client.send({ cmd: 'find_one_bank' }, id),
      );

      return getOneById;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch('update/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankDto: UpdateBankDto,
  ) {
    try {
      const updateBank = await firstValueFrom(
        this.client.send({ cmd: 'update_bank' }, { id, ...updateBankDto }),
      );
      return updateBank;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
