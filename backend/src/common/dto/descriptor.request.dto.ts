import { IsNotEmpty, IsString, NotContains } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class DescriptorRequestDto {
  @ApiProperty({
    description:
      'The wallet descriptor used to generate or retrieve wallet information',
    example: 'wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e)',
  })
  @IsString()
  @IsNotEmpty()
  @NotContains(' ', { message: 'Descriptor cannot contain blank spaces' })
  descriptor: string;
}
