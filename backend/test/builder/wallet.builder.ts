import { Transaction, UTXO } from '@common/interfaces/types';
import { WalletDto } from '@wallet/dto/wallet.dto';

export class WalletBuilder {
  private constructor(private wallet: WalletDto) {}

  static create(): WalletBuilder {
    return new WalletBuilder({
      balance: 10000,
      utxos: [],
      transactions: [],
      externalAddresses: [],
      internalAddresses: [],
    });
  }

  withBalance(balance: number): WalletBuilder {
    this.wallet.balance = balance;
    return this;
  }

  withUtxos(utxos: UTXO[]): WalletBuilder {
    this.wallet.utxos = utxos;
    return this;
  }

  withTransactions(transactions: Transaction[]): WalletBuilder {
    this.wallet.transactions = transactions;
    return this;
  }

  withExternalAddresses(externalAddresses: string[]): WalletBuilder {
    this.wallet.externalAddresses = externalAddresses;
    return this;
  }

  withInternalAddresses(internalAddresses: string[]): WalletBuilder {
    this.wallet.internalAddresses = internalAddresses;
    return this;
  }

  build(): WalletDto {
    return this.wallet;
  }
}
