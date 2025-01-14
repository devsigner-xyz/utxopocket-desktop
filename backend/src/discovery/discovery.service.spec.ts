import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { Descriptor } from '@descriptor/descriptor.value-object';
import { DiscoveryInstance } from '@bitcoinerlab/discovery';

jest.mock('@bitcoinerlab/discovery', () => ({
  DiscoveryFactory: jest.fn().mockReturnValue({
    Discovery: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue({ message: 'test' }),
    }),
  }),
}));

class MockDiscoveryService extends DiscoveryService {
  constructor(nodeService: NodeService) {
    super(nodeService);
  }

  setDiscoveryInstance(
    descriptor: Descriptor,
    discoveryInstance: MockProxy<DiscoveryInstance>,
  ) {
    this.discoveryInstances.set(descriptor.value, discoveryInstance);
  }

  hasInstance(descriptor: Descriptor): any {
    return this.discoveryInstances.has(descriptor.value);
  }
}

describe('DiscoveryService', () => {
  let discoveryService: MockDiscoveryService;
  let nodeService: MockProxy<NodeService>;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    discoveryService = new MockDiscoveryService(nodeService);
  });

  describe('getDiscoveryInstance', () => {
    it('should throw error when descriptor is not found', async () => {
      const descriptor = Descriptor.create('pk(A)');
      await expect(
        discoveryService.getDiscoveryInstance(descriptor),
      ).rejects.toThrow(
        `Discovery instance not found for descriptor: ${descriptor.value}`,
      );
    });

    it('should return discovery instance when descriptor is found', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const mockDiscoveryInstance = mock<DiscoveryInstance>();
      discoveryService.setDiscoveryInstance(descriptor, mockDiscoveryInstance);
      const discoveryInstance =
        await discoveryService.getDiscoveryInstance(descriptor);
      expect(discoveryInstance).toEqual(mockDiscoveryInstance);
    });
  });

  describe('createDiscoveryInstance', () => {
    it('should return message when descriptor is already loaded', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const mockDiscoveryInstance = mock<DiscoveryInstance>();
      discoveryService.setDiscoveryInstance(descriptor, mockDiscoveryInstance);
      const discoveryInstance =
        await discoveryService.createDiscoveryInstance(descriptor);
      expect(discoveryInstance).toEqual({
        message: 'Descriptor already loaded.',
      });
    });

    it('should create a discovery instance', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const discoveryInstance =
        await discoveryService.createDiscoveryInstance(descriptor);
      expect(discoveryInstance).toEqual({
        message: 'Descriptor loaded successfully.',
      });
    });
  });

  describe('removeDiscoveryInstance', () => {
    it('should remove discovery instance when descriptor is found', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const mockDiscoveryInstance = mock<DiscoveryInstance>();
      discoveryService.setDiscoveryInstance(descriptor, mockDiscoveryInstance);
      discoveryService.removeDiscoveryInstance(descriptor.value);
      expect(discoveryService.hasInstance(descriptor)).toBe(false);
    });
  });

  describe('clearDiscoveryInstances', () => {
    it('should clear all discovery instances', async () => {
      const descriptor = Descriptor.create('wpkh(A)');
      const mockDiscoveryInstance = mock<DiscoveryInstance>();
      discoveryService.setDiscoveryInstance(descriptor, mockDiscoveryInstance);
      discoveryService.clearDiscoveryInstances();
      expect(discoveryService.hasInstance(descriptor)).toBe(false);
    });
  });
});
