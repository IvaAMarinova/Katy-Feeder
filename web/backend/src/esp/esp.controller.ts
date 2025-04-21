import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Logger,
} from '@nestjs/common';
import { EspService, FeederCommand } from './esp.service';

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
}
