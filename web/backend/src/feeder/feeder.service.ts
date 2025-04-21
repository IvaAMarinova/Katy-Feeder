import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Feeder } from './feeder.entity';
import { validateOrReject } from 'class-validator';
import { User } from '../user/user.entity';

@Injectable()
export class FeederService {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Feeder>): Promise<Feeder> {
    const feeder = this.em.create(Feeder, {
      name: data.name!,
      isActive: data.isActive ?? false,
    });
    try {
      await validateOrReject(feeder);
      await this.em.persistAndFlush(feeder);
      return feeder;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findAll(): Promise<Feeder[]> {
    return this.em.find(Feeder, {}, { populate: ['users'] });
  }

  async findById(id: number): Promise<Feeder> {
    const feeder = await this.em.findOne(
      Feeder,
      { id },
      { populate: ['users'] },
    );
    if (!feeder) {
      throw new NotFoundException(`Feeder with ID ${id} not found`);
    }
    return feeder;
  }

  async update(id: number, data: Partial<Feeder>): Promise<Feeder> {
    const feeder = await this.findById(id);
    this.em.assign(feeder, data);
    await this.em.flush();
    return feeder;
  }

  async delete(id: number): Promise<void> {
    const feeder = await this.findById(id);
    await this.em.removeAndFlush(feeder);
  }

  async toggleActive(id: number): Promise<Feeder> {
    const feeder = await this.findById(id);
    feeder.isActive = !feeder.isActive;
    await this.em.flush();
    return feeder;
  }

  async addUser(feederId: number, userId: number): Promise<Feeder> {
    const feeder = await this.findById(feederId);
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    feeder.users.add(user);
    await this.em.flush();
    return feeder;
  }

  async removeUser(feederId: number, userId: number): Promise<Feeder> {
    const feeder = await this.findById(feederId);
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    feeder.users.remove(user);
    await this.em.flush();
    return feeder;
  }

  private handleUnexpectedError(error: any): never {
    throw error;
  }
}
