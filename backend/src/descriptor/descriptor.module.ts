import { Module } from '@nestjs/common';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DescriptorController } from '@descriptor/descriptor.controller';
import { ElectrumModule } from '@electrum/electrum.module';
import { DiscoveryModule } from '@discovery/discovery.module';
import { NodeModule } from '@node/node.module';

@Module({
  imports: [ElectrumModule, DiscoveryModule, NodeModule],
  providers: [DescriptorService],
  controllers: [DescriptorController],
  exports: [DescriptorService],
})
export class DescriptorModule {}
