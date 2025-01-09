import { Module } from '@nestjs/common';
import { LogsController } from '@log/log.controller';
import { LogService } from '@log/log.service';

@Module({
  controllers: [LogsController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
