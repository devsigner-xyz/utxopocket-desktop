import { Transaction, UTXO } from '@common/interfaces/types';

export interface WalletDto {
  balance: number;
  utxos: UTXO[];
  transactions: Transaction[];
  externalAddresses: string[];
  internalAddresses: string[];
}
