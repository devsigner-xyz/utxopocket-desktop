import { Module } from '@nestjs/common';
import { DiscoveryService } from '@discovery/discovery.service';
import { NodeModule } from '@node/node.module';

@Module({
  imports: [NodeModule],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
