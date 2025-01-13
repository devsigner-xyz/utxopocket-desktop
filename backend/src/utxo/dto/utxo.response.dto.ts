import { UTXO } from '@common/interfaces/types';
import { ApiProperty } from '@nestjs/swagger';

export class UtxoResponseDto {
  @ApiProperty()
  utxos: UTXO[];
}
