import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { Token, User } from './decorators';
import { ICurrentUser } from './interfaces/current.user.interface';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  async findAllUser() {
    try {
      const response = await firstValueFrom(
        this.client.send({ cmd: 'find.all.user' }, {}),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const response = await firstValueFrom(
        this.client.send({ cmd: 'auth.register.user' }, registerUserDto),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      const response = await firstValueFrom(
        this.client.send({ cmd: 'auth.login.user' }, loginUserDto),
      );

      const AccesToArca = await firstValueFrom(
        this.client.send({ cmd: 'arca_authorize' }, {}),
      );
      console.log(AccesToArca);
      return {
        ...response,
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  async verifyToken(@User() user: ICurrentUser, @Token() token: string) {
    try {
      return { user, token };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete/:id')
  async deleteContactId(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const deleteContact = await firstValueFrom(
        this.client.send({ cmd: 'delete.user.id' }, { id }),
      );
      return deleteContact;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
