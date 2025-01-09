import { Global, Module } from '@nestjs/common';
import { UtilsService } from '@common/utils/utils.service';
import { UtilsModule } from '@common/utils/utils.module';
import { LogModule } from '@log/log.module';
import { LogService } from '@log/log.service';

@Global()
@Module({
  imports: [UtilsModule, LogModule],
  providers: [UtilsService, LogService],
  exports: [UtilsService, LogService],
})
export class WalletGlobalModule {}
