import { UTXO } from '@common/interfaces/types';
import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  utxos: UTXO[];

  @ApiProperty()
  transactions: any[];

  @ApiProperty()
  externalAddresses: string[];

  @ApiProperty()
  internalAddresses: string[];
}
