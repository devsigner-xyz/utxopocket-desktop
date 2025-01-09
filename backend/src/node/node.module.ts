import { Module } from '@nestjs/common';
import { ElectrumModule } from '@electrum/electrum.module';
import { NodeService } from '@node/node.service';
import { NodeController } from './node.controller';

@Module({
  imports: [ElectrumModule],
  providers: [NodeService],
  controllers: [NodeController],
  exports: [NodeService],
})
export class NodeModule {}
