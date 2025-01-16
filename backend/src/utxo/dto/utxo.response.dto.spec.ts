// utxo.response.dto.spec.ts
import { UtxoResponseDto } from './utxo.response.dto';
import { UTXO } from '@common/interfaces/types';

describe('UtxoResponseDto', () => {
  it('should create a UtxoResponseDto instance with the correct properties', () => {
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

    const dto = new UtxoResponseDto();
    dto.utxos = mockUtxos;

    expect(dto).toBeInstanceOf(UtxoResponseDto);
    expect(dto.utxos).toBe(mockUtxos);
    expect(dto.utxos[0].txid).toBe('txid1');
    expect(dto.utxos[0].value).toBe(5000);
  });
});
