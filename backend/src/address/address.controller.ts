import { Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressesResponseDto } from './dto/address.response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller responsible for managing wallet address operations.
 */
@Controller('address')
export class AddressController {
  /**
   * Creates an instance of AddressController.
   *
   * @param addressService Service responsible for address operations.
   */
  constructor(private readonly addressService: AddressService) {}

  /**
   * Retrieves external and internal wallet addresses based on the provided descriptor.
   *
   * This endpoint accepts a wallet descriptor as a query parameter and returns
   * the corresponding external and internal addresses. It leverages the
   * AddressService to perform the address retrieval.
   *
   * @param descriptor - The descriptor used to generate or retrieve the addresses.
   * @returns An object containing arrays of external and internal addresses.
   *
   * @throws {Error} Throws an error if the address retrieval operation fails.
   */
  @Get('addresses')
  @ApiOperation({
    summary:
      'Get the external and internal addresses associated with a descriptor',
  })
  @ApiResponse({ status: 200, type: AddressesResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAddresses(
    @Query('descriptor') descriptor: string,
  ): Promise<AddressesResponseDto> {
    try {
      return await this.addressService.getAddresses(descriptor);
    } catch (error) {
      throw error;
    }
  }
}
