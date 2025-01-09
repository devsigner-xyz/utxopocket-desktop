import { Module } from '@nestjs/common';
import { BalanceService } from '@balance/balance.service';
import { NodeModule } from '@node/node.module';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@discovery/discovery.module';
import { BalanceController } from './balance.controller';

@Module({
  imports: [NodeModule, DescriptorModule, DiscoveryModule],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
