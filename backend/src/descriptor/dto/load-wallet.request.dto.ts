import { ApiProperty } from "@nestjs/swagger";

export class LoadWalletRequestDto {
  @ApiProperty()
  descriptor: string;

  @ApiProperty({ required: false })
  gapLimit?: number;
}
