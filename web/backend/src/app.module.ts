import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';
import { FeederModule } from './feeder/feeder.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    UserModule,
    PetModule,
    FeederModule,
  ],
})
export class AppModule {}
