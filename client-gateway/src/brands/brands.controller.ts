import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ParseUUIDPipe } from 'src/common/pipes';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/common/guards';
import { Roles } from 'src/common/decorators';
import { RoleAuthEnum } from 'src/common/enum/role.auth.enum';

@Controller('brands')
export class BrandsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleAuthEnum.ADMIN)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    try {
      const createBrand = await firstValueFrom(
        this.client.send({ cmd: 'create_brand' }, createBrandDto),
      );
      return createBrand;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const brand = await firstValueFrom(
        this.client.send({ cmd: 'find_one_brand' }, id),
      );
      return brand;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleAuthEnum.ADMIN)
  @Patch('update/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    try {
      const updateBrand = await firstValueFrom(
        this.client.send({ cmd: 'update_brand' }, { id, ...updateBrandDto }),
      );
      return updateBrand;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
