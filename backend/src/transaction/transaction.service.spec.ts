import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { Descriptor } from '@descriptor/descriptor.value-object';
import { DiscoveryInstance } from '@bitcoinerlab/discovery';
import { TransactionService } from './transaction.service';
import { LogService } from '@common/log/log.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { ElectrumExplorer } from '@bitcoinerlab/explorer';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let nodeService: MockProxy<NodeService>;
  let descriptorService: MockProxy<DescriptorService>;
  let discoveryService: MockProxy<DiscoveryService>;
  let logger: MockProxy<LogService>;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    descriptorService = mock<DescriptorService>();
    discoveryService = mock<DiscoveryService>();
    logger = mock<LogService>();
    transactionService = new TransactionService(
      nodeService,
      descriptorService,
      discoveryService,
      logger,
    );
  });

  describe('getBlockTimestamp', () => {
    it('should throw error when electrum explorer is not found', async () => {
      nodeService.getElectrumExplorer.mockReturnValue(null);
      await expect(transactionService.getBlockTimestamp(100)).rejects.toThrow(
        'Electrum Explorer not connected',
      );
    });

    it('should return block timestamp when electrum explorer is found', async () => {
      const blockHeight = 100;
      const blockTime = 1715731200;
      const mockElectrumExplorer = mock<ElectrumExplorer>();
      mockElectrumExplorer.fetchBlockStatus.mockResolvedValue({
        blockHeight,
        blockHash: 'hash',
        blockTime,
        irreversible: true,
      });
      nodeService.getElectrumExplorer.mockReturnValue(mockElectrumExplorer);
      const timestamp = await transactionService.getBlockTimestamp(blockHeight);
      expect(timestamp).toEqual(blockTime);
      expect(mockElectrumExplorer.fetchBlockStatus).toHaveBeenCalledWith(
        blockHeight,
      );
    });

    it('should return null when block status is not found', async () => {
      const blockHeight = 100;
      const mockElectrumExplorer = mock<ElectrumExplorer>();
      mockElectrumExplorer.fetchBlockStatus.mockResolvedValue(null);
      nodeService.getElectrumExplorer.mockReturnValue(mockElectrumExplorer);
      const timestamp = await transactionService.getBlockTimestamp(blockHeight);
      expect(timestamp).toEqual(null);
    });
  });
});
