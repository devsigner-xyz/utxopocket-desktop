import { MockProxy, mock } from 'jest-mock-extended';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { TransactionBuilder } from '../../test/builder/transaction.builder';
import { UtxoBuilder } from '../../test/builder/utxo.builder';
import { WalletBuilder } from '../../test/builder/wallet.builder';
import { HttpException, HttpStatus, LoggerService } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { LogService } from '@common/log/log.service';
import { ConnectNodeRequestDto } from './dto/connect.request.dto';
import { Network } from './enum/network.enum';

describe('NodeController', () => {
  let nodeController: NodeController;
  let nodeService: MockProxy<NodeService>;
  let logService: MockProxy<LogService>;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    logService = mock<LogService>();

    nodeController = new NodeController(nodeService, logService);
  });

  describe('connectNode', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      const connectNodeDto: ConnectNodeRequestDto = {
        host: 'invalid',
        port: 1,
        ssl: false,
        network: Network.TESTNET,
      };

      nodeService.connectNode.mockRejectedValue(new Error('test'));

      await expect(nodeController.connectNode(connectNodeDto)).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should connect to node successfully', async () => {
      const connectNodeDto: ConnectNodeRequestDto = {
        host: 'invalid',
        port: 1,
        ssl: false,
        network: Network.TESTNET,
      };

      nodeService.connectNode.mockResolvedValue({
        node: 'node',
        message: 'message',
      });

      const response = await nodeController.connectNode(connectNodeDto);
      expect(response).toEqual({
        node: 'node',
        message: 'message',
      });
      expect(nodeService.connectNode).toHaveBeenCalledWith(
        connectNodeDto.host,
        connectNodeDto.port,
        connectNodeDto.ssl,
        connectNodeDto.network,
      );
    });
  });

  describe('disconnectNode', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      nodeService.disconnectNode.mockRejectedValue(new Error('test'));

      await expect(nodeController.disconnectNode()).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should disconnect from node successfully', async () => {
      nodeService.disconnectNode.mockResolvedValue({
        message: 'message',
      });

      const response = await nodeController.disconnectNode();
      expect(response).toEqual({
        message: 'message',
      });
      expect(nodeService.disconnectNode).toHaveBeenCalled();
    });
  });
});
