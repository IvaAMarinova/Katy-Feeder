import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Pet } from './pet.entity';
import { validateOrReject } from 'class-validator';

@Injectable()
export class PetService {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Pet>): Promise<Pet> {
    const pet = this.em.create(
      Pet,
      data as Required<
        Pick<
          Pet,
          | 'name'
          | 'breed'
          | 'sex'
          | 'ageYears'
          | 'isNeutered'
          | 'activityLevel'
          | 'targetWeight'
          | 'currentWeight'
          | 'foodCoefficient'
          | 'feeder'
          | 'morningPortionGrams'
          | 'afternoonPortionGrams'
          | 'eveningPortionGrams'
          | 'lastWeightUpdateDate'
        >
      >,
    );
    try {
      await validateOrReject(pet);
      await this.em.persistAndFlush(pet);
      return pet;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findById(id: number): Promise<Pet> {
    const pet = await this.em.findOne(Pet, { id });
    if (!pet) throw new NotFoundException('Pet not found');
    return pet;
  }

  async update(id: number, data: Partial<Pet>): Promise<Pet> {
    const pet = await this.findById(id);
    this.em.assign(pet, data);
    await this.em.flush();
    return pet;
  }

  async delete(id: number): Promise<void> {
    const pet = await this.findById(id);
    await this.em.removeAndFlush(pet);
  }

  async findAll(): Promise<Pet[]> {
    return this.em.find(Pet, {});
  }

  async calculateDailyFoodAmount(
    petId: number,
  ): Promise<{ dailyFoodGrams: number }> {
    const pet = await this.findById(petId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // The calculation formula using pet's attributes
    const dailyFoodGrams = this.calculateFoodAmount(
      pet.currentWeight,
      pet.targetWeight,
      pet.foodCoefficient,
    );

    return { dailyFoodGrams };
  }

  private calculateFoodAmount(
    currentWeight: number,
    targetWeight: number,
    foodCoefficient: number,
  ): number {
    // Base calculation using RER (Resting Energy Requirement)
    const rer = 70 * Math.pow(currentWeight, 0.75);

    // Calculate daily energy needs with moderate activity level
    const dailyEnergy = rer * 1.4;

    // Apply food coefficient (calories per gram of food)
    const dailyFoodGrams = dailyEnergy / foodCoefficient;

    // Weight management adjustment
    const weightDiff = targetWeight - currentWeight;
    const adjustmentFactor = 1 + (weightDiff / currentWeight) * 0.1;

    return Math.round(dailyFoodGrams * adjustmentFactor);
  }

  private handleUnexpectedError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    )
      throw error;
    console.error(error);
    throw new BadRequestException('Unexpected error: ' + error.message);
  }

  async updateWeight(id: number, weights: number[]): Promise<Pet> {
    if (!Array.isArray(weights)) {
      throw new BadRequestException('Weights must be an array');
    }

    const pet = await this.findById(id);

    // Clean the data by filtering out invalid values
    const cleanWeights = weights.filter(
      (weight) => weight >= 0 && weight <= 100,
    );

    if (cleanWeights.length === 0) {
      throw new BadRequestException('No valid weight measurements provided');
    }

    // Calculate average weight
    const averageWeight =
      cleanWeights.reduce((sum, weight) => sum + weight, 0) /
      cleanWeights.length;

    // Round to 2 decimal places
    pet.currentWeight = Math.round(averageWeight * 100) / 100;
    pet.lastWeightUpdateDate = new Date();

    // Recalculate portions based on new weight
    this.calculatePortions(pet);

    await this.em.flush();
    return pet;
  }

  private calculatePortions(pet: Pet): void {
    const dailyGrams =
      pet.currentWeight * pet.foodCoefficient * pet.activityLevel;

    pet.morningPortionGrams = Math.round(dailyGrams * 0.4);
    pet.afternoonPortionGrams = Math.round(dailyGrams * 0.2);
    pet.eveningPortionGrams = Math.round(dailyGrams * 0.4);
  }

  async getCurrentPortions(id: number): Promise<{
    lastWeightUpdateDate: Date;
    currentWeight: number;
    portions: {
      morning: number;
      afternoon: number;
      evening: number;
    };
  }> {
    const pet = await this.findById(id);

    return {
      lastWeightUpdateDate: pet.lastWeightUpdateDate,
      currentWeight: pet.currentWeight,
      portions: {
        morning: pet.morningPortionGrams,
        afternoon: pet.afternoonPortionGrams,
        evening: pet.eveningPortionGrams,
      },
    };
  }

  async getPetForFeeder(feederId: number): Promise<Pet> {
    const pet = await this.em.findOne(Pet, { feeder: feederId });
    if (!pet) {
      throw new NotFoundException('No pet found for this feeder');
    }
    return pet;
  }
}
