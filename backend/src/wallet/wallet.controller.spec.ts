import { WalletService } from './wallet.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { WalletController } from './wallet.controller';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { TransactionBuilder } from '../../test/builder/transaction.builder';
import { UtxoBuilder } from '../../test/builder/utxo.builder';
import { WalletBuilder } from '../../test/builder/wallet.builder';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('WalletController', () => {
  let walletController: WalletController;
  let walletService: MockProxy<WalletService>;

  beforeEach(() => {
    walletService = mock<WalletService>();

    walletController = new WalletController(walletService);
  });

  describe('getWalletInfo', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'invalid',
      };

      walletService.getWalletInfo.mockRejectedValue(new Error('test'));

      await expect(
        walletController.getWalletInfo(descriptorRequestDto),
      ).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should return wallet info successfully', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'pk(A)',
      };

      const wallet = WalletBuilder.create()
        .withBalance(100)
        .withUtxos([UtxoBuilder.create('utxo1').build()])
        .withTransactions([TransactionBuilder.create('txid1').build()])
        .withExternalAddresses(['address1'])
        .withInternalAddresses(['address2'])
        .build();

      walletService.getWalletInfo.mockResolvedValue(wallet);

      const response =
        await walletController.getWalletInfo(descriptorRequestDto);
      expect(response).toEqual(wallet);
      expect(walletService.getWalletInfo).toHaveBeenCalledWith(
        descriptorRequestDto.descriptor,
      );
    });
  });
});
