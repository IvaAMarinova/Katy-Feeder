import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';

@Entity()
export class Feeder {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ default: false })
  isActive!: boolean;

  @ManyToMany(() => User)
  users = new Collection<User>(this);
}
