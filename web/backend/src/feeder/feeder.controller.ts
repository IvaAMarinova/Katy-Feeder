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
import { FeederService } from './feeder.service';
import { Feeder } from './feeder.entity';
import { PetService } from '../pet/pet.service';

@Controller('feeders')
export class FeederController {
  constructor(
    private readonly feederService: FeederService,
    private readonly petService: PetService,
  ) {}

  @Post()
  async create(@Body() feeder: Feeder): Promise<Feeder> {
    return this.feederService.create({
      name: feeder.name,
      isActive: feeder.isActive,
    });
  }

  @Get()
  async findAll(): Promise<Feeder[]> {
    return this.feederService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Feeder> {
    return this.feederService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() feeder: Feeder,
  ): Promise<Feeder> {
    return this.feederService.update(id, {
      name: feeder.name,
      isActive: feeder.isActive,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.feederService.delete(id);
  }

  @Put(':id/toggle')
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<Feeder> {
    return this.feederService.toggleActive(id);
  }

  @Post(':feederId/users/:userId')
  async addUser(
    @Param('feederId', ParseIntPipe) feederId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Feeder> {
    return this.feederService.addUser(feederId, userId);
  }

  @Delete(':feederId/users/:userId')
  async removeUser(
    @Param('feederId', ParseIntPipe) feederId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Feeder> {
    return this.feederService.removeUser(feederId, userId);
  }

  @Get(':id/next-portion')
  async getNextPortion(
    @Param('id', ParseIntPipe) feederId: number,
  ): Promise<{ grams: number }> {
    const feeder = await this.feederService.findById(feederId);
    const pet = await this.petService.getPetForFeeder(feederId);

    const hour = new Date().getHours();

    let grams = 0;
    if (hour >= 5 && hour < 12) {
      grams = pet.morningPortionGrams;
    } else if (hour >= 12 && hour < 17) {
      grams = pet.afternoonPortionGrams;
    } else {
      grams = pet.eveningPortionGrams;
    }

    return { grams };
  }
}
