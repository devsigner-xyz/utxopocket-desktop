import { ApiProperty } from '@nestjs/swagger';

export class DisconnectResponseDto {
  @ApiProperty()
  message: string;
}
