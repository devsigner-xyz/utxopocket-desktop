export interface TxInput {
  txid: string;
  index: number;
  script: string;
  sequence: number;
  value?: number;
}

export interface TxOutput {
  value: number;
  scriptPubKey: string;
  txid: string;
  vout: number;
  height: number;
  address?: string;
  timestamp?: number;
  locked?: boolean;
  isReused?: boolean;
  isUtxoChange?: boolean;
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  blockHeight?: number;
  timestamp?: number;
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
  address: string;
  height: number | null;
  timestamp: number | null;
  locked: boolean;
  isReused: boolean;
  isUtxoChange: boolean;
}

export interface SortItem {
  key: string;
  order?: boolean | 'asc' | 'desc';
}

// src/common/interfaces/types.ts

export interface TransactionPart {
  name: string;
  value?: string | number;
  bytes: string;
  txid?: string;
  vout?: number;
  scriptSig?: string;
  sequence?: number;
  scriptPubKey?: string;
  witness?: string;
}
