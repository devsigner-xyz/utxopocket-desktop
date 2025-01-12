import { ApiProperty } from "@nestjs/swagger";

export class AddressesResponseDto {
  @ApiProperty()
  externalAddresses: string[];

  @ApiProperty()
  internalAddresses: string[];
}