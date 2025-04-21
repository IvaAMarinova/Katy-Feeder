import { defineConfig } from '@mikro-orm/mysql';
import { LoadStrategy } from '@mikro-orm/core';
import { User } from './src/user/user.entity';
import { Pet } from './src/pet/pet.entity';
import { Feeder } from './src/feeder/feeder.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'testpassword',
  dbName: process.env.DB_NAME || 'katyfeeder_db',
  entities: [User, Pet, Feeder],
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  migrations: {
    path: './migrations',
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}',
  },
});
