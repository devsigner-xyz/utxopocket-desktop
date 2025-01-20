import { Global, Module } from '@nestjs/common';
import { LogModule } from '@log/log.module';
import { LogService } from '@log/log.service';

@Global()
@Module({
  imports: [LogModule],
  providers: [LogService],
  exports: [LogService],
})
export class CommonModule {}
