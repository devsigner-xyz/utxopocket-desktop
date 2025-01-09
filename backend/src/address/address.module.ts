import { Module } from '@nestjs/common';
import { AddressService } from '@address/address.service';
import { NodeModule } from '@node/node.module';
import { DescriptorModule } from '@descriptor/descriptor.module';
import { DiscoveryModule } from '@discovery/discovery.module';
import { DescriptorService } from '@descriptor/descriptor.service';
import { AddressController } from './address.controller';

@Module({
  imports: [NodeModule, DescriptorModule, DiscoveryModule],
  providers: [AddressService, DescriptorService],
  controllers: [AddressController],
  exports: [AddressService],
})
export class AddressModule {}
