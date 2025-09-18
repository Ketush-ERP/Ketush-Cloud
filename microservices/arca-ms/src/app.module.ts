import { Module } from '@nestjs/common';
import { ArcaModule } from './arca/arca.module';

@Module({
  imports: [ArcaModule],
})
export class AppModule {}
