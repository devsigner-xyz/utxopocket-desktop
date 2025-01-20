import { MockProxy, mock } from 'jest-mock-extended';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { TransactionBuilder } from '../../test/builder/transaction.builder';
import { UtxoBuilder } from '../../test/builder/utxo.builder';
import { WalletBuilder } from '../../test/builder/wallet.builder';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

describe('BalanceController', () => {
  let balanceController: BalanceController;
  let balanceService: MockProxy<BalanceService>;

  beforeEach(() => {
    balanceService = mock<BalanceService>();

    balanceController = new BalanceController(balanceService);
  });

  describe('getBalance', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'invalid',
      };

      balanceService.getBalance.mockRejectedValue(new Error('test'));

      await expect(
        balanceController.getBalance(descriptorRequestDto),
      ).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should return balance successfully', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'pk(A)',
      };

      const balance = 100;

      balanceService.getBalance.mockResolvedValue({
        balance,
      });

      const response = await balanceController.getBalance(descriptorRequestDto);
      expect(response).toEqual({
        balance,
      });
      expect(balanceService.getBalance).toHaveBeenCalledWith(
        descriptorRequestDto.descriptor,
      );
    });
  });
});
