import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { BalanceService } from './balance.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryInstance } from '@bitcoinerlab/discovery';
import { Descriptor } from '@descriptor/descriptor.value-object';

describe('BalanceService', () => {
  let balanceService: BalanceService;
  let descriptorService: MockProxy<DescriptorService>;
  let nodeService: MockProxy<NodeService>;
  let discoveryService: MockProxy<DiscoveryService>;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    descriptorService = mock<DescriptorService>();
    discoveryService = mock<DiscoveryService>();
    balanceService = new BalanceService(
      nodeService,
      descriptorService,
      discoveryService,
    );
  });

  describe('getBalance', () => {
    it('should return the balance', async () => {
      const descriptor = Descriptor.create('pk(A)');
      const balance = 100.32;
      const mockDiscovery = mock<DiscoveryInstance>();
      mockDiscovery.getBalance.mockReturnValue(balance);
      discoveryService.getDiscoveryInstance.mockResolvedValue(mockDiscovery);
      const response = await balanceService.getBalance(descriptor.value);
      expect(response).toEqual({ balance: balance });
      expect(discoveryService.getDiscoveryInstance).toHaveBeenCalledWith(
        descriptor,
      );
      const { externalDescriptor, internalDescriptor } =
        descriptor.deriveDescriptors();
      expect(mockDiscovery.getBalance).toHaveBeenCalledWith({
        descriptors: [externalDescriptor, internalDescriptor],
      });
    });
  });
});
