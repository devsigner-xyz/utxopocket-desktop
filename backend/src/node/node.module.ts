import { Module } from '@nestjs/common';
import { ElectrumModule } from '@electrum/electrum.module';
import { NodeService } from '@node/node.service';
import { NodeController } from './node.controller';
import { LogModule } from '@common/log/log.module';

@Module({
  imports: [ElectrumModule, LogModule],
  providers: [NodeService],
  controllers: [NodeController],
  exports: [NodeService],
})
export class NodeModule {}
