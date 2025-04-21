import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PetService } from '../pet/pet.service';
import { FeederService } from '../feeder/feeder.service';

export interface FeederCommand {
  action: 'dispense' | 'none';
  grams?: number;
}

@Injectable()
export class EspService {
  private readonly logger = new Logger(EspService.name);
  private readonly feedingHours = [9, 15, 20];
  private lastDispensedHour: Map<number, number> = new Map();

  constructor(
    private readonly em: EntityManager,
    private readonly petService: PetService,
    private readonly feederService: FeederService,
  ) {}

  async getFeederCommand(
    feederId: number,
    debug = false,
  ): Promise<FeederCommand> {
    try {
      const feeder = await this.feederService.findById(feederId);

      this.logger.debug(`Found feeder: ${JSON.stringify(feeder)}`);

      if (!feeder.isActive) {
        return { action: 'none' };
      }

      const pet = await this.petService.getPetForFeeder(feederId);
      const currentHour = new Date().getHours();

      if (debug) {
        const grams = await this.petService.getCurrentPortions(pet.id);
        return {
          action: 'dispense',
          grams: grams.portions.morning,
        };
      }

      if (!this.feedingHours.includes(currentHour)) {
        return { action: 'none' };
      }

      const lastHour = this.lastDispensedHour.get(feederId);
      if (lastHour === currentHour) {
        return { action: 'none' };
      }

      this.lastDispensedHour.set(feederId, currentHour);

      let portionGrams: number;
      if (currentHour === 9) {
        portionGrams = pet.morningPortionGrams;
      } else if (currentHour === 15) {
        portionGrams = pet.afternoonPortionGrams;
      } else {
        portionGrams = pet.eveningPortionGrams;
      }

      return {
        action: 'dispense',
        grams: portionGrams,
      };
    } catch (error) {
      this.logger.error(`Error in getFeederCommand: ${error.message}`);
      throw error;
    }
  }
}
