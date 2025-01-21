import { Module } from '@nestjs/common';
import { WalletService } from '@wallet/wallet.service';
import { WalletController } from '@wallet/wallet.controller';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@nestjs/core';
import { AddressModule } from '@address/address.module';
import { BalanceModule } from '@balance/balance.module';
import { BlockModule } from '@block/block.module';
import { TransactionModule } from '@transaction/transaction.module';
import { UtxoModule } from '@utxo/utxo.module';
import { NodeModule } from '@node/node.module';
import { ElectrumModule } from '@electrum/electrum.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    BalanceModule,
    UtxoModule,
    TransactionModule,
    AddressModule,
    CommonModule,
    DescriptorModule,
    DiscoveryModule,
    BlockModule,
    NodeModule,
    ElectrumModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
