import { ApiProperty } from "@nestjs/swagger";

export class LoadWalletResponseDto {
  @ApiProperty()
  message: string;
}
