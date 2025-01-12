import { ApiProperty } from '@nestjs/swagger';

export class TransactionHistoryResponseDto {
  @ApiProperty()
  transactions: any[];
}
