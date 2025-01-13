import { ApiProperty } from '@nestjs/swagger';
import { Network } from '@node/enum/network.enum';
import { IsString, IsInt, IsBoolean, IsIn, IsEnum, isEnum } from 'class-validator';

export class ConnectNodeRequestDto {
  @ApiProperty()
  @IsString()
  host: string;

  @ApiProperty()
  @IsInt()
  port: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  ssl: boolean;

  @ApiProperty({ enum: Network })
  @IsEnum(Network)
  network: Network;
}
