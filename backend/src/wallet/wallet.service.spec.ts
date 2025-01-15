import mock, { MockProxy } from 'jest-mock-extended/lib/Mock';
import { WalletService } from './wallet.service';
import { AddressService } from '@address/address.service';
import { BalanceService } from '@balance/balance.service';
import { UtxoService } from '@utxo/utxo.service';
import { TransactionService } from '@transaction/transaction.service';
import { Transaction, UTXO } from '@common/interfaces/types';

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
    it('should return wallet info', async () => {
      const balance = 100;
      balanceService.getBalance.mockResolvedValue({ balance });
      utxoService.getUtxos.mockResolvedValue({ utxos: [] });
      transactionService.getTransactionHistory.mockResolvedValue({
        transactions: [],
      });
      addressService.getAddresses.mockResolvedValue({
        externalAddresses: [],
        internalAddresses: [],
      });
      const walletInfo = await walletService.getWalletInfo('pk(A)');
      expect(walletInfo).toEqual({
        balance,
        utxos: [],
        transactions: [],
        externalAddresses: [],
        internalAddresses: [],
      });
    });
  });
});
