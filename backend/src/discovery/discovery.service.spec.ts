import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { Descriptor } from '@descriptor/descriptor.value-object';

jest.mock('@bitcoinerlab/discovery', () => ({
  DiscoveryFactory: jest.fn().mockReturnValue({
    Discovery: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue({ message: 'test' }),
    }),
  }),
}));

describe('DiscoveryService', () => {
  let discoveryService: DiscoveryService;
  let nodeService: MockProxy<NodeService>;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    discoveryService = new DiscoveryService(nodeService);
  });

  describe('getDiscoveryInstance', () => {
    it('should throw error when descriptor is not found', async () => {
      const descriptor = Descriptor.create('pk(A)');
      await expect(discoveryService.getDiscoveryInstance(descriptor))
        .rejects.toThrow(`Discovery instance not found for descriptor: ${descriptor.value}`);
    });
  });

  describe('createDiscoveryInstance', () => {
    it('should create a discovery instance', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const discoveryInstance = await discoveryService.createDiscoveryInstance(descriptor, 100);
      expect(discoveryInstance).toEqual({ message: 'Descriptor loaded successfully.' });
    });
  });
});

