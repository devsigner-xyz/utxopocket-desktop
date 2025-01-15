import { WalletService } from './wallet.service';
import { AddressService } from '@address/address.service';
import { BalanceService } from '@balance/balance.service';
import { UtxoService } from '@utxo/utxo.service';
import { TransactionService } from '@transaction/transaction.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { UTXO } from '@common/interfaces/types';

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
    it('should return wallet info successfully', async () => {
      const descriptor = 'pk(A)';
      const mockBalance = 100;

      const mockUtxos: UTXO[] = [
        {
          txid: 'txid1',
          vout: 0,
          value: 5000,
          scriptPubKey: '76a91489abcdefabbaabbaabbaabbaabbaabbaabba88ac',
          address: 'tb1qaddress1',
          height: 150000,
          timestamp: 1633024800,
          locked: false,
          isReused: false,
          isUtxoChange: false,
        },
      ];

      const mockTransactions = [
        {
          txid: 'txid1',
          fee: 100,
          inputs: [],
          outputs: [],
          version: 2,
          locktime: 0,
          size: 200,
          weight: 800,
        },
      ];

      const mockAddresses = {
        externalAddresses: ['address1'],
        internalAddresses: ['address2'],
      };

      balanceService.getBalance.mockResolvedValue({ balance: mockBalance });
      utxoService.getUtxos.mockResolvedValue({ utxos: mockUtxos });
      transactionService.getTransactionHistory.mockResolvedValue({
        transactions: mockTransactions,
      });
      addressService.getAddresses.mockResolvedValue(mockAddresses);

      const walletInfo = await walletService.getWalletInfo(descriptor);

      expect(walletInfo).toEqual({
        balance: mockBalance,
        utxos: mockUtxos,
        transactions: mockTransactions,
        externalAddresses: mockAddresses.externalAddresses,
        internalAddresses: mockAddresses.internalAddresses,
      });
    });
  });
});
