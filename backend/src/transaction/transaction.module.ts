import { LogModule } from '@common/log/log.module';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@discovery/discovery.module';
import { Module } from '@nestjs/common';
import { NodeModule } from '@node/node.module';
import { TransactionService } from '@transaction/transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [NodeModule, DescriptorModule, DiscoveryModule, LogModule],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
