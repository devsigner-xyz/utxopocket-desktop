import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { NodeService } from '@node/node.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { Descriptor } from '@descriptor/descriptor.value-object';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AddressService', () => {
  let addressService: AddressService;
  let nodeService: MockProxy<NodeService>;
  let descriptorService: MockProxy<DescriptorService>;
  let discoveryService: MockProxy<DiscoveryService>;

  beforeEach(async () => {
    nodeService = mock<NodeService>();
    descriptorService = mock<DescriptorService>();
    discoveryService = mock<DiscoveryService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: NodeService, useValue: nodeService },
        { provide: DescriptorService, useValue: descriptorService },
        { provide: DiscoveryService, useValue: discoveryService },
      ],
    }).compile();

    addressService = module.get<AddressService>(AddressService);
  });

  describe('getAddresses', () => {
    it('should return externalAddresses and internalAddresses when successful', async () => {
      nodeService.ensureElectrumConnection.mockResolvedValue();

      const mockNetwork = {
        messagePrefix: 'testnet',
        bech32: 'tb',
        bip32: { public: 0x043587cf, private: 0x04358394 },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      };
      nodeService.getNetwork.mockReturnValue(mockNetwork);

      const descriptorString =
        'wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e/0/*)';
      const descriptorVO = Descriptor.create(descriptorString);

      const discoveryMock = {
        getNextIndex: jest.fn().mockReturnValueOnce(3).mockReturnValueOnce(2),
      };
      discoveryService.getDiscoveryInstance.mockResolvedValue(
        discoveryMock as any,
      );

      const result = await addressService.getAddresses(descriptorString);

      expect(nodeService.ensureElectrumConnection).toHaveBeenCalled();
      expect(discoveryService.getDiscoveryInstance).toHaveBeenCalledWith(
        descriptorVO,
      );
      expect(result).toHaveProperty('externalAddresses');
      expect(result).toHaveProperty('internalAddresses');

      expect(result.externalAddresses.length).toBe(3);
      expect(result.internalAddresses.length).toBe(2);

      result.externalAddresses.forEach((addr) => {
        expect(addr).toBeDefined();
      });
      result.internalAddresses.forEach((addr) => {
        expect(addr).toBeDefined();
      });
    });

    it('should catch errors and throw HttpException INTERNAL_SERVER_ERROR', async () => {
      nodeService.ensureElectrumConnection.mockResolvedValue();
      nodeService.getNetwork.mockReturnValue({} as any);

      discoveryService.getDiscoveryInstance.mockRejectedValue(
        new Error('Simulated error'),
      );

      await expect(addressService.getAddresses('wpkh(...)')).rejects.toThrow(
        HttpException,
      );

      try {
        await addressService.getAddresses('wpkh(...)');
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((error as HttpException).message).toBe('Simulated error');
      }
    });

    it('should return external addresses without internal addresses if getNextIndex fails for internalDescriptor', async () => {
      nodeService.ensureElectrumConnection.mockResolvedValue();
      const mockNetwork = {
        messagePrefix: 'testnet',
        bech32: 'tb',
        bip32: { public: 0x043587cf, private: 0x04358394 },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      };
      nodeService.getNetwork.mockReturnValue(mockNetwork);

      const descriptorString =
        'wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e/0/*)';

      const discoveryMock = {
        getNextIndex: jest
          .fn()
          .mockReturnValueOnce(2)
          .mockImplementationOnce(() => {
            throw new Error('No internal addresses found');
          }),
      };
      discoveryService.getDiscoveryInstance.mockResolvedValue(
        discoveryMock as any,
      );

      const result = await addressService.getAddresses(descriptorString);

      expect(result.externalAddresses.length).toBe(2);
      expect(result.internalAddresses.length).toBe(0);
    });
  });

  describe('getDerivedAddresses', () => {
    it('should derive addresses using the Output correctly', () => {
      const mockNetwork = {
        messagePrefix: 'testnet',
        bech32: 'tb',
        bip32: { public: 0x043587cf, private: 0x04358394 },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      };
      nodeService.getNetwork.mockReturnValue(mockNetwork);

      const descriptorString =
        'wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e/0/*)';
      const derived = addressService.getDerivedAddresses(descriptorString);

      derived.forEach((address) => {
        expect(address).toBeDefined();
      });
    });
  });
});
