import { Module } from '@nestjs/common';
import { UtxoService } from '@utxo//utxo.service';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@discovery/discovery.module';
import { NodeModule } from '@node/node.module';
import { AddressModule } from '@address/address.module';
import { UtxoController } from './utxo.controller';

@Module({
  imports: [DescriptorModule, DiscoveryModule, NodeModule, AddressModule],
  providers: [UtxoService],
  controllers: [UtxoController],
  exports: [UtxoService],
})
export class UtxoModule {}
