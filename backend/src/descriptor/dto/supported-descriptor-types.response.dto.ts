import { DescriptorType } from "@descriptor/enum/descryptor-type.enum";
import { ApiProperty } from "@nestjs/swagger";

export class SupportedDescriptorTypesResponseDto {
  @ApiProperty({ enum: DescriptorType, isArray: true })
  supportedTypes: DescriptorType[];
}
