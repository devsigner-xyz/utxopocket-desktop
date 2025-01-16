import { WalletService } from './wallet.service';
import { AddressService } from '@address/address.service';
import { BalanceService } from '@balance/balance.service';
import { UtxoService } from '@utxo/utxo.service';
import { TransactionService } from '@transaction/transaction.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { TransactionBuilder } from '../../test/builder/transaction.builder';
import { UtxoBuilder } from '../../test/builder/utxo.builder';
import { WalletBuilder } from '../../test/builder/wallet.builder';

describe('WalletService', () => {
  let walletService: WalletService;
  let balanceService: MockProxy<BalanceService>;
  let utxoService: MockProxy<UtxoService>;
  let transactionService: MockProxy<TransactionService>;
  let addressService: MockProxy<AddressService>;

  beforeEach(() => {
    balanceService = mock<BalanceService>();
    utxoService = mock<UtxoService>();
    transactionService = mock<TransactionService>();
    addressService = mock<AddressService>();

    walletService = new WalletService(
      balanceService,
      utxoService,
      transactionService,
      addressService,
    );
  });

  describe('getWalletInfo', () => {
    it('should throw an error when error retrieving wallet balance', async () => {
      const descriptor = 'pk(A)';
      balanceService.getBalance.mockRejectedValue(new Error('test'));
      await expect(walletService.getWalletInfo(descriptor)).rejects.toThrow(
        new Error('Failed to retrieve wallet information: test'),
      );
    });

    it('should return wallet info successfully', async () => {
      const descriptor = 'pk(A)';
      const wallet = WalletBuilder.create()
        .withBalance(100)
        .withUtxos([UtxoBuilder.create('utxo1').build()])
        .withTransactions([TransactionBuilder.create('txid1').build()])
        .withExternalAddresses(['address1'])
        .withInternalAddresses(['address2'])
        .build();

      balanceService.getBalance.mockResolvedValue({ balance: wallet.balance });
      utxoService.getUtxos.mockResolvedValue({ utxos: wallet.utxos });
      transactionService.getTransactionHistory.mockResolvedValue({
        transactions: wallet.transactions,
      });
      addressService.getAddresses.mockResolvedValue({
        externalAddresses: wallet.externalAddresses,
        internalAddresses: wallet.internalAddresses,
      });

      const response = await walletService.getWalletInfo(descriptor);

      expect(response).toEqual(wallet);
    });
  });
});
