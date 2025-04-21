import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { Pet } from './pet.entity';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  async create(@Body() pet: Pet): Promise<Pet> {
    return this.petService.create(pet);
  }

  @Get()
  async findAll(): Promise<Pet[]> {
    return this.petService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Pet> {
    return this.petService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() pet: Pet): Promise<Pet> {
    return this.petService.update(id, pet);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.petService.delete(id);
  }

  @Get(':id/daily-food')
  async calculateDailyFood(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ dailyFoodGrams: number }> {
    return this.petService.calculateDailyFoodAmount(id);
  }

  @Put(':id/weight')
  async updateWeight(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { weights: number[] },
  ) {
    return this.petService.updateWeight(id, body.weights);
  }

  @Get(':id/portions')
  async getCurrentPortions(@Param('id', ParseIntPipe) id: number) {
    return this.petService.getCurrentPortions(id);
  }
}
