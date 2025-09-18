import { Module } from "@nestjs/common";
import { VouchersModule } from "./vouchers/vouchers.module";
import { BanksModule } from "./banks/banks.module";
import { CardModule } from './card/card.module';

@Module({
  imports: [VouchersModule, BanksModule, CardModule],
})
export class AppModule {}
