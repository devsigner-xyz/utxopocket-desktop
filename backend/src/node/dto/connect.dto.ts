import { IsString, IsInt, IsBoolean, IsIn } from 'class-validator';

export class ConnectNodeDto {
  @IsString()
  host: string;

  @IsInt()
  port: number;

  @IsBoolean()
  ssl: boolean;

  @IsString()
  @IsIn(['mainnet', 'testnet'])
  network: 'mainnet' | 'testnet';
}
