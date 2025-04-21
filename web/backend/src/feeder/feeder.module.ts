import { Module } from '@nestjs/common';
import { FeederController } from './feeder.controller';
import { FeederService } from './feeder.service';
import { PetModule } from '../pet/pet.module';

@Module({
  imports: [PetModule],
  controllers: [FeederController],
  providers: [FeederService],
  exports: [FeederService],
})
export class FeederModule {}
