import { Test, TestingModule } from '@nestjs/testing';
import { UtxoService } from './utxo.service';
import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { AddressService } from '@address/address.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { Network, Transaction } from 'bitcoinjs-lib';

describe('UtxoService', () => {
  let utxoService: UtxoService;
  let nodeService: MockProxy<NodeService>;
  let discoveryService: MockProxy<DiscoveryService>;
  let addressService: MockProxy<AddressService>;

  beforeEach(async () => {
    nodeService = mock<NodeService>();
    discoveryService = mock<DiscoveryService>();
    addressService = mock<AddressService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtxoService,
        { provide: NodeService, useValue: nodeService },
        { provide: DiscoveryService, useValue: discoveryService },
        { provide: AddressService, useValue: addressService },
      ],
    }).compile();

    utxoService = module.get<UtxoService>(UtxoService);
  });

  describe('getUtxos', () => {
    it('should return UTXOs if successful', async () => {
      nodeService.ensureElectrumConnection.mockResolvedValue();
      const mockNetwork: Network = {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: { public: 0x0488b21e, private: 0x0488ade4 },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      };
      nodeService.getNetwork.mockReturnValue(mockNetwork);
      const mockDiscoveryInstance = {
        getUtxos: jest.fn().mockReturnValue(new Set(['tx123:0', 'tx456:1'])),
        getHistory: jest.fn().mockReturnValue([
          { txId: 'tx123', blockHeight: 1000 },
          { txId: 'tx456', blockHeight: 2000 },
        ]),
        getTxHex: jest.fn().mockImplementation(({ txId }) => {
          const tx = new Transaction();

          // Agregamos un input "dummy" para que la transacción sea parseable
          tx.addInput(Buffer.alloc(32), 0);

          if (txId === 'tx123') {
            // Reemplaza la salida con un script válido, por ejemplo P2WPKH
            tx.addOutput(
              Buffer.from(
                '00140123456789abcdef0123456789abcdef01234567', // 20 bytes luego de '0014'
                'hex',
              ),
              50000,
            );
          } else if (txId === 'tx456') {
            tx.addInput(Buffer.alloc(32), 0);
            tx.addOutput(
              Buffer.from(
                '00140123456789abcdef0123456789abcdef01234567',
                'hex',
              ),
              30000,
            );
            tx.addOutput(
              Buffer.from(
                '00140123456789abcdef0123456789abcdef01234567',
                'hex',
              ),
              20000,
            );
          }

          return tx.toHex();
        }),
      };
      discoveryService.getDiscoveryInstance.mockResolvedValue(
        mockDiscoveryInstance as any,
      );
      jest
        .spyOn(utxoService, 'getBlockTimestamp')
        .mockResolvedValue(1670000000);
      addressService.getDerivedAddresses.mockReturnValue(['addressChange']);
      nodeService.getElectrumExplorer.mockReturnValue({
        fetchTxHistory: jest.fn().mockResolvedValue([{ tx_hash: 'sample' }]),
      } as any);
      const result = await utxoService.getUtxos('wpkh(dummy)');
      expect(nodeService.ensureElectrumConnection).toHaveBeenCalled();
      expect(result.utxos.length).toBe(2);
      expect(result.utxos[0].txid).toBe('tx123');
      expect(result.utxos[0].value).toBe(50000);
      expect(result.utxos[1].txid).toBe('tx456');
      expect(result.utxos[1].value).toBe(20000);
    });
  });

  describe('getBlockTimestamp', () => {
    it('should return blockTime if present in blockStatus', async () => {
      nodeService.getElectrumExplorer.mockReturnValue({
        fetchBlockStatus: jest
          .fn()
          .mockResolvedValue({ blockTime: 1677777777 }),
      } as any);
      const result = await utxoService.getBlockTimestamp(1000);
      expect(result).toBe(1677777777);
    });

    it('should request block header if blockTime is not available', async () => {
      nodeService.getElectrumExplorer.mockReturnValue({
        fetchBlockStatus: jest.fn().mockResolvedValue({}),
        client: {
          request: jest.fn().mockResolvedValue('00'.repeat(160)),
        },
      } as any);
      const result = await utxoService.getBlockTimestamp(1000);
      expect(result).toBe(0);
    });

    it('should return null if block header is invalid', async () => {
      nodeService.getElectrumExplorer.mockReturnValue({
        fetchBlockStatus: jest.fn().mockResolvedValue({}),
        client: {
          request: jest.fn().mockResolvedValue(null),
        },
      } as any);
      const result = await utxoService.getBlockTimestamp(1000);
      expect(result).toBeNull();
    });

    it('should throw an error if electrumExplorer is not connected', async () => {
      nodeService.getElectrumExplorer.mockReturnValue(null);
      await expect(utxoService.getBlockTimestamp(1000)).rejects.toThrowError(
        'Electrum Explorer not connected',
      );
    });
  });
});
