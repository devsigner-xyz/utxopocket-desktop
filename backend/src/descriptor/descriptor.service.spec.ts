import { NodeService } from '@node/node.service';
import { Cache } from '@nestjs/cache-manager';
import { DiscoveryService } from '@discovery/discovery.service';
import { DescriptorService } from './descriptor.service';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { Descriptor } from './descriptor.value-object';

describe('DescriptorService', () => {
  let descriptorService: DescriptorService;
  let cacheManager: MockProxy<Cache>;
  let nodeService: MockProxy<NodeService>;
  let discoveryService: MockProxy<DiscoveryService>;

  beforeEach(() => {
    cacheManager = mock<Cache>();
    nodeService = mock<NodeService>();
    discoveryService = mock<DiscoveryService>();
    descriptorService = new DescriptorService(cacheManager, nodeService, discoveryService);
  });

  describe('getNetwork', () => {
    it('should return the network', () => {
      const mockNetwork = {
        messagePrefix: 'testnet',
        bech32: 'testnet',
        bip32: {
          public: 0x043587cf,
          private: 0x04358394,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0,
        wif: 0
      };

      nodeService.getNetwork.mockReturnValue(mockNetwork);

      const network = descriptorService.getNetwork();
      expect(network).toEqual(mockNetwork);
    });
  });

  describe('getStoredDescriptor', () => {
    it('should return null when the descriptor is not in the cache', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const descriptor = await descriptorService.getStoredDescriptor();
      expect(descriptor).toBeNull();
    });

    it('should return the descriptor when it is in the cache', async () => {
      cacheManager.get.mockResolvedValue('pk(A)');
      const descriptor = await descriptorService.getStoredDescriptor();
      expect(descriptor).toEqual(Descriptor.create('pk(A)'));
    });
  });

  describe('loadDescriptor', () => {
    it('should load the wallet with gap and return the discovery instance', async () => {
      discoveryService.createDiscoveryInstance.mockResolvedValue({ message: 'test' });
      const result = await descriptorService.loadWallet('pk(A)', 200);
      expect(nodeService.ensureElectrumConnection).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('walletDescriptor', 'pk(A)');
      expect(result).toEqual({ message: 'test' });
      expect(discoveryService.createDiscoveryInstance).toHaveBeenCalledWith(
        Descriptor.create('pk(A)'),
        200,
      );
    });

    it('should load the wallet and return the discovery instance', async () => {
      discoveryService.createDiscoveryInstance.mockResolvedValue({ message: 'test' });
      const result = await descriptorService.loadWallet('pk(A)');
      expect(nodeService.ensureElectrumConnection).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('walletDescriptor', 'pk(A)');
      expect(result).toEqual({ message: 'test' });
      expect(discoveryService.createDiscoveryInstance).toHaveBeenCalledWith(
        Descriptor.create('pk(A)'),
        100,
      );
    });
  });
});

