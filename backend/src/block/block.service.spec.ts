import { Test, TestingModule } from '@nestjs/testing';
import { BlockService } from './block.service';
import { NodeService } from '@node/node.service';
import { ElectrumExplorer } from '@bitcoinerlab/explorer';
import { MockProxy, mock } from 'jest-mock-extended';

describe('BlockService', () => {
  let blockService: BlockService;
  let nodeService: MockProxy<NodeService>;

  beforeEach(async () => {
    nodeService = mock<NodeService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        { provide: NodeService, useValue: nodeService },
      ],
    }).compile();

    blockService = module.get<BlockService>(BlockService);
  });

  describe('pollBlocks', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should emit new block status when the height changes', (done) => {
      const mockExplorer: Partial<ElectrumExplorer> = {
        connect: jest.fn(),
        close: jest.fn(),
        isConnected: jest.fn().mockResolvedValue(true),
        isClosed: jest.fn().mockReturnValue(false),
        fetchBlockHeight: jest
          .fn()
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(101),
        fetchBlockStatus: jest.fn().mockResolvedValue({ blockTime: 123456 }),
        fetchTx: jest.fn(),
      };

      nodeService.getElectrumExplorer.mockReturnValue(
        mockExplorer as ElectrumExplorer,
      );
      nodeService.ensureElectrumConnection.mockResolvedValue();

      const subscription = blockService.pollBlocks().subscribe({
        next: (status) => {
          expect(status).toEqual({ blockTime: 123456 });
          subscription.unsubscribe();
          done();
        },
        error: (err) => {
          subscription.unsubscribe();
          done.fail(err);
        },
      });

      jest.runOnlyPendingTimers();
      jest.advanceTimersByTime(5000);
    });

    it('should emit an error if fetchBlockHeight fails', (done) => {
      const mockExplorer: Partial<ElectrumExplorer> = {
        connect: jest.fn(),
        close: jest.fn(),
        isConnected: jest.fn().mockResolvedValue(true),
        isClosed: jest.fn().mockReturnValue(false),
        fetchBlockHeight: jest.fn().mockRejectedValue(new Error('HeightError')),
        fetchBlockStatus: jest.fn(),
        fetchTx: jest.fn(),
      };

      nodeService.getElectrumExplorer.mockReturnValue(
        mockExplorer as ElectrumExplorer,
      );
      nodeService.ensureElectrumConnection.mockResolvedValue();

      const subscription = blockService.pollBlocks().subscribe({
        next: () => {
          subscription.unsubscribe();
          done.fail('Should not emit a value');
        },
        error: (err) => {
          expect(err.message).toBe('HeightError');
          subscription.unsubscribe();
          done();
        },
      });

      jest.runOnlyPendingTimers();
    });
  });

  describe('getBlockTimestamp', () => {
    it('should return blockTime if present', async () => {
      const mockExplorer: Partial<ElectrumExplorer> = {
        connect: jest.fn(),
        close: jest.fn(),
        isConnected: jest.fn().mockResolvedValue(true),
        isClosed: jest.fn().mockReturnValue(false),
        fetchBlockHeight: jest.fn(),
        fetchBlockStatus: jest.fn().mockResolvedValue({ blockTime: 999999 }),
        fetchTx: jest.fn(),
      };

      nodeService.getElectrumExplorer.mockReturnValue(
        mockExplorer as ElectrumExplorer,
      );

      const result = await blockService.getBlockTimestamp(10);
      expect(result).toBe(999999);
    });

    it('should retrieve block header if blockTime not present', async () => {
      // Extend interface so TS accepts "client"
      const mockExplorer: Partial<ElectrumExplorer & { client?: any }> = {
        connect: jest.fn(),
        close: jest.fn(),
        isConnected: jest.fn().mockResolvedValue(true),
        isClosed: jest.fn().mockReturnValue(false),
        fetchBlockHeight: jest.fn(),
        fetchBlockStatus: jest.fn().mockResolvedValue({}),
        fetchTx: jest.fn(),
        client: {
          request: jest.fn().mockResolvedValue(
            '00'.repeat(160),
          ),
        },
      };

      nodeService.getElectrumExplorer.mockReturnValue(
        mockExplorer as ElectrumExplorer,
      );

      const result = await blockService.getBlockTimestamp(11);
      expect(result).toBe(0);
    });

    it('should throw if explorer is null', async () => {
      nodeService.getElectrumExplorer.mockReturnValue(null);
      await expect(blockService.getBlockTimestamp(12)).rejects.toThrow(
        'Electrum Explorer not connected',
      );
    });

    it('should throw if client is not available', async () => {
      const mockExplorer: Partial<ElectrumExplorer> = {
        connect: jest.fn(),
        close: jest.fn(),
        isConnected: jest.fn().mockResolvedValue(true),
        isClosed: jest.fn().mockReturnValue(false),
        fetchBlockHeight: jest.fn(),
        fetchBlockStatus: jest.fn().mockResolvedValue({}),
        fetchTx: jest.fn(),
      };

      nodeService.getElectrumExplorer.mockReturnValue(
        mockExplorer as ElectrumExplorer,
      );

      await expect(blockService.getBlockTimestamp(13)).rejects.toThrow(
        'Electrum client not available',
      );
    });
  });
});
