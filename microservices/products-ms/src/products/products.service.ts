import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BrandsService } from 'src/brands/brands.service';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { PaginateWithMeta, PaginationDto } from 'src/common';
import {
  UploadWhitFileDto,
  ChangeProfitMarginOfProductDto,
  ChangeCommissionPercentageOfProductDto,
} from './dto/upload-whit-file.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  // 👉 Método privado para construir el filtro de búsqueda
  private _buildSearchQuery(search?: string) {
    const where: any = { available: true };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private _calculatePercentage(
    price: string | number,
    profitMargin: number,
  ): string {
    const parsePrice = parseFloat(price as string);
    const total = (parsePrice * (1 + profitMargin / 100)).toFixed(2);

    return total;
  }

  private _returnPriceAndPercentageProducts(products: any[]) {
    const productsWithProfit = products.map((product) => {
      const basePrice = parseFloat(product.basePrice);
      const margin = product.profitMargin || 0;
      const finalPrice = basePrice + (basePrice * margin) / 100;

      const commission = product.commissionPercentage || 0;
      const commissionPrice = finalPrice + (finalPrice * commission) / 100;
      return {
        ...product,
        basePrice: basePrice,
        price: finalPrice,
        commissionPrice,
      };
    });

    return productsWithProfit;
  }

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly brandService: BrandsService,
  ) {
    super();
  }

  onModuleInit() {
    void this.$connect();
    this.logger.log('Database connected');
  }

  private async upsertProduct(
    createProductDto: CreateProductDto,
    cardId: string,
    commissionPercentage: number,
    profitMargin: number,
  ) {
    const { code, price, description, available, brandId, supplierId } =
      createProductDto;

    const existingProduct = await this.findByCode(code);
    if (existingProduct) {
      // Actualizar solo el precio
      await this.eProduct.update({
        where: { code },
        data: {
          basePrice: price,
        },
      });
      return {
        code,
        message: 'Product updated (price changed)',
        status: HttpStatus.OK,
      };
    } else {
      // Crear nuevo producto
      const newProduct = await this.eProduct.create({
        data: {
          code,
          price: this._calculatePercentage(price, profitMargin),
          basePrice: price,
          commissionPrice: this._calculatePercentage(
            price,
            commissionPercentage,
          ),
          description,
          available,
          brandId,
          supplierId,
          cardId,
        },
      });

      return {
        code,
        message: 'Product created successfully',
        status: HttpStatus.CREATED,
      };
    }
  }

  async bulkCreate(uploadWhitFileDto: UploadWhitFileDto) {
    try {
      const { rows, id } = uploadWhitFileDto;
      const supplier = await firstValueFrom(
        this.client.send({ cmd: 'find_one_contact' }, id),
      );
      const existingCard = await firstValueFrom(
        this.client.send({ cmd: 'find_all_card' }, {}),
      );

      if (!supplier) {
        return {
          message: 'Proveedor no existe',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const results = await Promise.all(
        rows.map(async (product) => {
          try {
            await this.upsertProduct(
              {
                ...product,
                supplierId: id,
              },
              existingCard[0]?.id,
              existingCard[0]?.commissionPercentage, // Pass the cardId argument
              supplier?.profitMargin,
            );
            return {
              code: product.code,
              message: 'Product created successfully',
              status: HttpStatus.CREATED,
            };
          } catch (error) {
            return {
              code: product.code,
              message: error.message || 'Error creating product',
              status: HttpStatus.BAD_REQUEST,
            };
          }
        }),
      );

      return results;
    } catch (error) {
      return {
        message: error,
      };
    }
  }

  async create(createProductDto: CreateProductDto) {
    const { brandId, code, description, available, supplierId, price } =
      createProductDto;

    const existingProduct = await this.findByCode(code);

    if (existingProduct) {
      throw new RpcException({
        message: `[CREATE] Product with code ${code} already exists`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (brandId) {
      const isBrand = await this.brandService.findOne(brandId);
      if (!isBrand) {
        throw new RpcException({
          message: `[CREATE] Brand with id ${brandId} not found`,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }

    if (!supplierId) {
      throw new RpcException({
        message: `[CREATE] Supplier column not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const existingSupplier = await firstValueFrom(
      this.client.send({ cmd: 'find_one_contact' }, supplierId),
    );

    const existingCard = await firstValueFrom(
      this.client.send({ cmd: 'find_all_card' }, {}),
    );

    if (!existingProduct) {
      return {
        message: `[CREATE] Supplier with id ${supplierId} not found`,
        status: HttpStatus.BAD_REQUEST,
      };
    }

    const newProduct = await this.eProduct.create({
      data: {
        code: code,
        price: this._calculatePercentage(price, existingSupplier?.profitMargin),
        basePrice: price,
        commissionPrice: this._calculatePercentage(
          price,
          existingCard[0]?.commissionPercentage || 0,
        ),
        cardId: existingCard[0]?.id,
        description: description,
        available: available,
        brandId: brandId,
        profitMargin: existingSupplier?.profitMargin,
        supplierId: existingSupplier?.id,
      },
    });

    return newProduct;
  }

  async findAll(paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const totalProducts = await this.eProduct.count({
      where: { available: true },
      orderBy: {
        description: 'asc',
      },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    // Obtener productos junto con el supplier (para tener el profitMargin)
    const products = await this.eProduct.findMany({
      skip: (offset - 1) * limit,
      take: limit,
      where: { available: true },
      select: {
        id: true,
        code: true,
        basePrice: true,
        price: true,
        description: true,
        profitMargin: true,
        commissionPercentage: true,
        commissionPrice: true,
        available: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    // Aplicar el margen de ganancia al precio base
    const productsWithProfit = this._returnPriceAndPercentageProducts(products);

    return {
      data: productsWithProfit,
      meta: {
        total: totalProducts,
        page: offset,
        lastPage: totalPages,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.eProduct.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      return {
        message: `[FIND_ONE] El producto no existe o se dio de baja ${id}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }

    return product;
  }

  async findByCode(code: string, throwIfNotFound = false) {
    const product = await this.eProduct.findFirst({
      where: { code },
      orderBy: {
        description: 'asc',
      },
    });
    if (!product && throwIfNotFound) {
      throw new RpcException({
        message: `[FIND_BY_CODE] Product with code ${code} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return product;
  }

  async updateProfitMargin(
    changeProfitMarginOfProductDto: ChangeProfitMarginOfProductDto,
  ) {
    try {
      const { supplierId, profitMargin } = changeProfitMarginOfProductDto;
      const product = await this.eProduct.updateMany({
        where: {
          supplierId: supplierId,
          available: true,
        },
        data: {
          profitMargin,
        },
      });

      return {
        message: `[UPDATE_PROFIT_MARGIN] Product updated`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      return {
        message: `[UPDATE_PROFIT_MARGIN] Error al actualizar el margen de ganancia`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  async updateCommissionPercentage(
    changeCommissionPercentageOfProductDto: ChangeCommissionPercentageOfProductDto,
  ) {
    try {
      const { cardId, commissionPercentage } =
        changeCommissionPercentageOfProductDto;

      // 1. Buscar todos los productos de esa cardId
      const products = await this.eProduct.updateMany({
        where: {
          available: true,
        },
        data: {
          cardId,
          commissionPercentage: commissionPercentage || 0,
        },
      });

      console.log(products);

      if (!products) {
        return {
          message: `[UPDATE_COMMISSION_PERCENTAGE] No se encontraron productos disponibles para esa cardId`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      return {
        message: `[UPDATE_COMMISSION_PERCENTAGE]  productos actualizados`,
        status: HttpStatus.OK,
      };
    } catch (error) {
      return {
        message: `[UPDATE_COMMISSION_PERCENTAGE] Error al actualizar el porcentaje de comisión`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  async searchProducts(paginationDto: PaginationDto) {
    const { query, offset, limit, supplierId, orderPrice } = paginationDto;

    const where = {
      ...this._buildSearchQuery(query),
      ...(supplierId && { supplierId }),
    };

    const totalProducts = await this.eProduct.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await this.eProduct.findMany({
      skip: (offset - 1) * limit,
      take: limit,
      where,
      orderBy: {
        description: 'asc',
        basePrice: orderPrice ? orderPrice : undefined,
      },
      select: {
        id: true,
        supplierId: true,
        code: true,
        description: true,
        basePrice: true,
        commissionPercentage: true,
        commissionPrice: true,
        profitMargin: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    if (products.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: '[SEARCH_PRODUCTS] No products found',
      });
    }

    const productsWithProfit = this._returnPriceAndPercentageProducts(products);

    return {
      data: productsWithProfit,
      meta: {
        total: totalProducts,
        page: offset,
        lastPage: totalPages,
      },
    };
  }

  async validateProducts(ids: string[]) {
    // TODO:El set permite que los Ids no esten duplicados, crea una nueva lista.
    ids = Array.from(new Set(ids));

    // TODO: Esta estructura de where permite encontrar todos los ids en la BD, por lo que si uno de ellos no se encuentra no lo devuelve.
    const product = await this.eProduct.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (product.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: '[VALIDATE_PRODUCTS] Some products were not found',
      });
    }

    return product;
  }
}
