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
  private foodTimerEnd: Date | null = null;
  private drinkTimerEnd: Date | null = null;
  private foodTimerDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
  private drinkTimerDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly feedingHours = [9, 15, 20];
  private lastDispensedHour: Map<number, number> = new Map();
  private pendingFeedings: Map<number, number> = new Map(); // Store pending feed amounts

  constructor(
    private readonly em: EntityManager,
    private readonly petService: PetService,
    private readonly feederService: FeederService,
  ) {}

  async triggerImmediateFeeding(feederId: number): Promise<void> {
    const pet = await this.petService.getPetForFeeder(feederId);
    const grams = pet.morningPortionGrams; // Use morning portion as default
    this.pendingFeedings.set(feederId, grams);
    this.logger.debug(`Set pending feeding for feeder ${feederId}: ${grams}g`);
  }

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

      // Check for pending feeding first
      const pendingGrams = this.pendingFeedings.get(feederId);
      if (pendingGrams) {
        this.pendingFeedings.delete(feederId); // Clear the pending feeding
        this.logger.debug(`Executing pending feeding: ${pendingGrams}g`);
        return {
          action: 'dispense',
          grams: pendingGrams,
        };
      }

      // Regular feeding schedule logic
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

  async setTimer(type: 'food' | 'drink', minutes: number): Promise<void> {
    const milliseconds = minutes * 60 * 1000;
    if (type === 'food') {
      this.foodTimerDuration = milliseconds;
      this.foodTimerEnd = new Date(Date.now() + milliseconds);
    } else {
      this.drinkTimerDuration = milliseconds;
      this.drinkTimerEnd = new Date(Date.now() + milliseconds);
    }
  }

  async resetTimer(type: 'food' | 'drink'): Promise<void> {
    const now = new Date();
    if (type === 'food') {
      this.foodTimerEnd = new Date(now.getTime() + this.foodTimerDuration);
    } else {
      this.drinkTimerEnd = new Date(now.getTime() + this.drinkTimerDuration);
    }
  }

  async getTimerStatus(): Promise<{
    foodTimeRemaining: number;
    drinkTimeRemaining: number;
  }> {
    const now = new Date();

    if (!this.foodTimerEnd) {
      this.foodTimerEnd = new Date(now.getTime() + this.foodTimerDuration);
    }
    if (!this.drinkTimerEnd) {
      this.drinkTimerEnd = new Date(now.getTime() + this.drinkTimerDuration);
    }

    const foodTimeRemaining = Math.max(
      0,
      this.foodTimerEnd.getTime() - now.getTime(),
    );
    const drinkTimeRemaining = Math.max(
      0,
      this.drinkTimerEnd.getTime() - now.getTime(),
    );

    return { foodTimeRemaining, drinkTimeRemaining };
  }
}
