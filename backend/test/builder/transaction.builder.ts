import { Transaction } from '@common/interfaces/types';

export class TransactionBuilder {
  private constructor(private transaction: Transaction) {}

  public static create(txid: string): TransactionBuilder {
    return new TransactionBuilder({
      txid: txid,
      fee: 100,
      inputs: [],
      outputs: [],
      version: 2,
      locktime: 0,
      size: 200,
      weight: 800,
    });
  }

  build(): Transaction {
    return this.transaction;
  }
}
