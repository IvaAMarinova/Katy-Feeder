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
  private pendingFeedings: Map<number, number> = new Map();
  private foodTimerEnd: Date;
  private drinkTimerEnd: Date;
  private foodTimerDuration = 2 * 60 * 1000; // 2 minutes default
  private drinkTimerDuration = 5 * 60 * 1000; // 5 minutes default

  constructor(
    private readonly em: EntityManager,
    private readonly petService: PetService,
    private readonly feederService: FeederService,
  ) {
    this.initializeTimers();
  }

  async getFeederCommand(
    feederId: number,
    debug = false,
  ): Promise<FeederCommand> {
    const feeder = await this.feederService.findById(feederId);
    if (!feeder) {
      throw new NotFoundException(`Feeder ${feederId} not found`);
    }

    // Check for pending immediate feeding
    const pendingGrams = this.pendingFeedings.get(feederId);
    if (pendingGrams) {
      this.pendingFeedings.delete(feederId);
      return {
        action: 'dispense',
        grams: pendingGrams,
      };
    }

    return { action: 'none' };
  }

  async triggerImmediateFeeding(feederId: number): Promise<void> {
    const feeder = await this.feederService.findById(feederId);
    if (!feeder) {
      throw new NotFoundException(`Feeder ${feederId} not found`);
    }

    // Get the associated pet to determine portion size
    const pet = await this.em.findOne('Pet', { feeder: feederId });
    if (!pet) {
      throw new NotFoundException(`No pet associated with feeder ${feederId}`);
    }

    // Use morning portion as default immediate feeding amount
    const portionGrams = (pet as any).morningPortionGrams;

    // Store the pending feeding
    this.pendingFeedings.set(feederId, portionGrams);

    this.logger.debug(
      `Triggered immediate feeding for feeder ${feederId}: ${portionGrams}g`,
    );
  }

  private initializeTimers(): void {
    const now = new Date();
    // Start both timers immediately when service starts
    this.foodTimerEnd = now; // This makes timer start at 0
    this.drinkTimerEnd = now; // This makes timer start at 0
    this.logger.log('Timers initialized');
    this.logger.debug(`Food timer ends at: ${this.foodTimerEnd}`);
    this.logger.debug(`Drink timer ends at: ${this.drinkTimerEnd}`);
  }

  async getTimerStatus(): Promise<{
    foodTimeRemaining: number;
    drinkTimeRemaining: number;
    foodTimerDuration: number;
    drinkTimerDuration: number;
  }> {
    const now = new Date().getTime();

    const foodTimeRemaining = Math.max(0, this.foodTimerEnd.getTime() - now);
    const drinkTimeRemaining = Math.max(0, this.drinkTimerEnd.getTime() - now);

    // Remove auto-reset logic
    // if (foodTimeRemaining === 0) {
    //   this.foodTimerEnd = new Date(now + this.foodTimerDuration);
    // }
    // if (drinkTimeRemaining === 0) {
    //   this.drinkTimerEnd = new Date(now + this.drinkTimerDuration);
    // }

    return {
      foodTimeRemaining,
      drinkTimeRemaining,
      foodTimerDuration: this.foodTimerDuration,
      drinkTimerDuration: this.drinkTimerDuration,
    };
  }

  async resetTimer(type: 'food' | 'drink'): Promise<void> {
    const now = new Date();

    if (type === 'food') {
      this.foodTimerEnd = new Date(now.getTime() + this.foodTimerDuration);
      this.logger.debug(`Food timer reset. Ends at: ${this.foodTimerEnd}`);
    } else {
      this.drinkTimerEnd = new Date(now.getTime() + this.drinkTimerDuration);
      this.logger.debug(`Drink timer reset. Ends at: ${this.drinkTimerEnd}`);
    }
  }

  async setTimer(type: 'food' | 'drink', minutes: number): Promise<void> {
    const duration = minutes * 60 * 1000; // Convert minutes to milliseconds
    const now = new Date();

    if (type === 'food') {
      this.foodTimerDuration = duration;
      this.foodTimerEnd = new Date(now.getTime() + duration);
      this.logger.debug(
        `Food timer duration set to ${minutes} minutes. Current timer ends at: ${this.foodTimerEnd}`,
      );
    } else {
      this.drinkTimerDuration = duration;
      this.drinkTimerEnd = new Date(now.getTime() + duration);
      this.logger.debug(
        `Drink timer duration set to ${minutes} minutes. Current timer ends at: ${this.drinkTimerEnd}`,
      );
    }
  }
}
