import { Module } from '@nestjs/common';
import { FeedingHistoryService } from './feeding-history.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FeedingHistory } from './feeding-history.entity';

@Module({
  imports: [MikroOrmModule.forFeature([FeedingHistory])],
  providers: [FeedingHistoryService],
  exports: [FeedingHistoryService],
})
export class FeedingHistoryModule {}