import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './user.entity';
import { validateOrReject } from 'class-validator';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.em.create(
      User,
      data as Required<Pick<User, 'email' | 'password'>>,
    );
    try {
      await validateOrReject(user);
      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    this.em.assign(user, data);
    await this.em.flush();
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.em.removeAndFlush(user);
  }

  async findAll(): Promise<User[]> {
    return this.em.find(User, {});
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
