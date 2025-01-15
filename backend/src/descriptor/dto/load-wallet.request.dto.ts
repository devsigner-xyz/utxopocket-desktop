import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoadWalletRequestDto extends DescriptorRequestDto {
  @ApiProperty({ required: false })
  gapLimit?: number;
}
