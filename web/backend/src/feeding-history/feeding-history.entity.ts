import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Pet } from '../pet/pet.entity';

@Entity()
export class FeedingHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  timestamp = new Date();

  @Property()
  amountGrams!: number;

  @Property()
  source!: 'auto' | 'manual' | 'scale-trigger';

  @ManyToOne(() => Pet)
  pet!: Pet;
}
