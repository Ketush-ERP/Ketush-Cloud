import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IProductsController, PaginationDto } from 'src/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NATS_SERVICE } from 'src/config';
import { ParseStringPipe } from 'src/common/pipes';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/common/guards';
import { Roles } from 'src/common/decorators';
import { RoleAuthEnum } from 'src/common/enum/role.auth.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductParserService } from './utils';

@Controller('products')
export class ProductsController implements IProductsController {
  private _chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly parserService: ProductParserService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleAuthEnum.ADMIN)
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const createProducts = await firstValueFrom(
        this.client.send({ cmd: 'create_product' }, createProductDto),
      );
      return createProducts;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Query('id') id: string,
    @Query('containsVAT') containsVAT: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const includesVAT = containsVAT === 'true';
      const supplier = await firstValueFrom(
        this.client.send({ cmd: 'find_one_contact' }, id),
      );
      const products = await this.parserService.parse(
        supplier.nameFile,
        file.buffer,
        includesVAT,
      );
      const chunkSize = 500;
      const batches = this._chunkArray(products, chunkSize);
      for (const batch of batches) {
        try {
          const response = await firstValueFrom(
            this.client.send(
              { cmd: 'upload_products_with_file' },
              { rows: batch, id },
            ),
          );
        } catch (error) {
          throw new RpcException(error);
        }
      }
      return {
        totalProducts: products.length,
        totalBatches: batches.length,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error general en uploadFile',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get()
  async findAllProducts(@Query() paginationDto: PaginationDto) {
    try {
      const findAll = await firstValueFrom(
        this.client.send({ cmd: 'find_all_product' }, paginationDto),
      );
      return findAll;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('search')
  async findProductsBySearch(@Query() paginationDto: PaginationDto) {
    try {
      const findProducts = await firstValueFrom(
        this.client.send({ cmd: 'search_products' }, paginationDto),
      );
      return findProducts;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleAuthEnum.ADMIN, RoleAuthEnum.SELLER)
  @Patch('update/:id')
  async updateProduct(
    @Param('id', ParseStringPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const updateProduct = await firstValueFrom(
        this.client.send(
          { cmd: 'update_product' },
          {
            id,
            ...updateProductDto,
          },
        ),
      );
      return updateProduct;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
