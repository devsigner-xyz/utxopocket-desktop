import { UTXO } from '@common/interfaces/types';

export class UtxoBuilder {
  private constructor(private readonly utxo: UTXO) {}

  static create(txid: string): UtxoBuilder {
    return new UtxoBuilder({
      txid,
      vout: 0,
      value: 5000,
      scriptPubKey: '76a91489abcdefabbaabbaabbaabbaabbaabbaabba88ac',
      address: 'tb1qaddress1',
      height: 150000,
      timestamp: 1633024800,
      locked: false,
      isReused: false,
      isUtxoChange: false,
    });
  }

  build(): UTXO {
    return this.utxo;
  }
}
