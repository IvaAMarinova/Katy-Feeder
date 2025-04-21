import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Feeder } from './feeder.entity';
import { FeederService } from './feeder.service';
import { FeederController } from './feeder.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Feeder])],
  providers: [FeederService],
  exports: [FeederService, MikroOrmModule],
  controllers: [FeederController],
})
export class FeederModule {}
