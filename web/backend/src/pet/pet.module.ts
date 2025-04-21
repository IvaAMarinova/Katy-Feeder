import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Pet } from './pet.entity';
import { PetService } from './pet.service';
// import { PetController } from './pet.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Pet])],
  providers: [PetService],
  exports: [PetService, MikroOrmModule],
  // controllers: [PetController],
})
export class PetModule {}
