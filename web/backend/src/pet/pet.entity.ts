import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Feeder } from '../feeder/feeder.entity';

@Entity()
export class Pet {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  breed!: string;

  @Property()
  sex!: 'male' | 'female';

  @Property()
  ageYears!: number;

  @Property()
  isNeutered!: boolean;

  @Property()
  activityLevel!: number;

  @Property()
  targetWeight!: number;

  @Property()
  currentWeight!: number;

  @Property()
  foodCoefficient!: number;

  @ManyToOne(() => Feeder)
  feeder!: Feeder;
}
