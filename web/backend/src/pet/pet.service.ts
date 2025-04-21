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

  private handleUnexpectedError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    )
      throw error;
    console.error(error);
    throw new BadRequestException('Unexpected error: ' + error.message);
  }
}