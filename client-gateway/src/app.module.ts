import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { ContactsModule } from './contacts/contacts.module';
import { CardModule } from './card/card.module';
import { BankModule } from './bank/bank.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    ProductsModule,
    NatsModule,
    AuthModule,
    BrandsModule,
    ContactsModule,
    CardModule,
    BankModule,
    VoucherModule,
  ],
})
export class AppModule {}
