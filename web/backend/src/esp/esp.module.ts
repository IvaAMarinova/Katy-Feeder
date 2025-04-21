import { Module } from '@nestjs/common';
import { EspController } from './esp.controller';
import { EspService } from './esp.service';
import { PetModule } from '../pet/pet.module';
import { FeederModule } from '../feeder/feeder.module';

@Module({
  imports: [PetModule, FeederModule],
  controllers: [EspController],
  providers: [EspService],
})
export class EspModule {}
