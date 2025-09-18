import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt';

import { RegisterUserDto, Role } from './dto';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async onModuleInit() {
    void this.$connect();
    this.logger.log('PostgresDB connected');
  }

  async findAllUser() {
    try {
      const user = await this.user.findMany();
      return user;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  }

  async signJWT(payload: IJwtPayload): Promise<string> {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password, cuil, role } = registerUserDto;
    try {
      const user = await this.user.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email,
          name,
          cuil,
          role: role ?? Role.SELLER,
          password: bcrypt.hashSync(password, 10), // Hash the password
        },
      });

      const { password: _, ...rest } = newUser;
      return {
        status: 201,
        message: 'User created successfully',
        data: {
          user: rest,
          token: await this.signJWT(rest),
        },
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await this.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'User/Password not vailid',
        });
      }

      const isPassordValid = bcrypt.compareSync(password, user.password);
      if (!isPassordValid) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'User/Password not valid',
        });
      }

      const { password: _, createdAt, updatedAt, ...rest } = user;
      return {
        status: 201,
        message: 'User login successfully',
        data: {
          user: rest,
          token: await this.signJWT(rest),
        },
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        message: 'Invalid token',
      });
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.user.delete({
        where: {
          id,
        },
      });

      if (!user) {
        throw new RpcException({
          error: HttpStatus.BAD_GATEWAY,
          message: 'No exite el usuario, no se pudo eliminar',
        });
      }

      return user;
    } catch (error) {
      throw new RpcException({
        error: HttpStatus.BAD_GATEWAY,
        message: `No se pudo eliminar el usuario: ${error.message}`,
      });
    }
  }
}
