import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { EspService } from './esp.service';
import { FeederCommand } from './esp.service';

@Controller('esp/commands')
export class EspController {
  private readonly logger = new Logger(EspController.name);

  constructor(private readonly espService: EspService) {}

  @Get('feeder/:id')
  async getFeederCommand(
    @Param('id', ParseIntPipe) feederId: number,
    @Query('debug') debug?: string,
  ): Promise<FeederCommand> {
    this.logger.debug(
      `Getting command for feeder ${feederId}, debug: ${debug}`,
    );
    try {
      const result = await this.espService.getFeederCommand(feederId, !!debug);
      this.logger.debug(`Command result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error getting feeder command: ${error.message}`);
      throw error;
    }
  }

  @Post('feeder/:id/feed-now')
  async triggerFeeding(
    @Param('id', ParseIntPipe) feederId: number,
  ): Promise<{ success: boolean }> {
    this.logger.debug(`Triggering immediate feeding for feeder ${feederId}`);
    try {
      await this.espService.triggerImmediateFeeding(feederId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error triggering feeding: ${error.message}`);
      throw error;
    }
  }

  @Get('timer-status')
  async getTimerStatus() {
    this.logger.debug('Getting timer status');
    return this.espService.getTimerStatus();
  }

  @Post('reset-timer/:type')
  async resetTimer(@Param('type') type: 'food' | 'drink') {
    this.logger.debug(`Resetting timer for: ${type}`);
    await this.espService.resetTimer(type);
    return { success: true };
  }

  @Post('set-timer/:type/:minutes')
  async setTimer(
    @Param('type') type: 'food' | 'drink',
    @Param('minutes', ParseIntPipe) minutes: number,
  ) {
    this.logger.debug(`Setting ${type} timer for ${minutes} minutes`);
    await this.espService.setTimer(type, minutes);
    return { success: true };
  }
}
