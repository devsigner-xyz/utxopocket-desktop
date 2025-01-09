import { Module } from '@nestjs/common';
import { WalletService } from '@wallet/wallet.service';
import { WalletController } from '@wallet/wallet.controller';
import { WalletGlobalModule } from '@common/common.module';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@nestjs/core';
import { AddressModule } from '@address/address.module';
import { BalanceModule } from '@balance/balance.module';
import { BlockModule } from '@block/block.module';
import { TransactionModule } from '@transaction/transaction.module';
import { UtxoModule } from '@utxo/utxo.module';
import { NodeModule } from '@node/node.module';

@Module({
  imports: [
    BalanceModule,
    UtxoModule,
    TransactionModule,
    AddressModule,
    WalletGlobalModule,
    DescriptorModule,
    DiscoveryModule,
    BlockModule,
    NodeModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
