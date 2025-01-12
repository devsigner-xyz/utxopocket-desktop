import { DescriptorType } from "@descriptor/enum/descryptor-type.enum";
import { ApiProperty } from "@nestjs/swagger";

export class ValidateDescriptorResponseDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  error?: string;
}
