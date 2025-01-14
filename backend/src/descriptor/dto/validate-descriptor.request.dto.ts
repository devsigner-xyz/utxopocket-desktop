import { ApiProperty } from '@nestjs/swagger';

export class ValidateDescriptorRequestDto {
  @ApiProperty()
  descriptor: string;
}
