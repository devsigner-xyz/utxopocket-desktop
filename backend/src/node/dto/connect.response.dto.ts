import { ApiProperty } from "@nestjs/swagger";

export class ConnectResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  node: string;
}
