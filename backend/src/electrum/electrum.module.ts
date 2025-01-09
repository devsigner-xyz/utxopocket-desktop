import { Module } from '@nestjs/common';
import { ElectrumService } from '@electrum/electrum.service';

@Module({
  providers: [ElectrumService],
  exports: [ElectrumService],
})
export class ElectrumModule {}
