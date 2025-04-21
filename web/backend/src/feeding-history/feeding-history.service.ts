import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FeedingHistory } from './feeding-history.entity';
import { validateOrReject } from 'class-validator';
import { Pet } from '../pet/pet.entity';

@Injectable()
export class FeedingHistoryService {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<FeedingHistory>): Promise<FeedingHistory> {
    const feedingHistory = this.em.create(
      FeedingHistory,
      data as Required<
        Pick<FeedingHistory, 'amountGrams' | 'source' | 'pet' | 'timestamp'>
      >,
    );
    try {
      await validateOrReject(feedingHistory);
      await this.em.persistAndFlush(feedingHistory);
      return feedingHistory;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findById(id: number): Promise<FeedingHistory> {
    const feedingHistory = await this.em.findOne(FeedingHistory, { id });
    if (!feedingHistory)
      throw new NotFoundException('Feeding history not found');
    return feedingHistory;
  }

  async update(
    id: number,
    data: Partial<FeedingHistory>,
  ): Promise<FeedingHistory> {
    const feedingHistory = await this.findById(id);
    this.em.assign(feedingHistory, data);
    await this.em.flush();
    return feedingHistory;
  }

  async delete(id: number): Promise<void> {
    const feedingHistory = await this.findById(id);
    await this.em.removeAndFlush(feedingHistory);
  }

  async findAll(): Promise<FeedingHistory[]> {
    return this.em.find(FeedingHistory, {});
  }

  async findByPet(petId: number): Promise<FeedingHistory[]> {
    const pet = await this.em.findOne(Pet, { id: petId });
    if (!pet) throw new NotFoundException('Pet not found');

    return this.em.find(FeedingHistory, { pet });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<FeedingHistory[]> {
    return this.em.find(FeedingHistory, {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    });
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
