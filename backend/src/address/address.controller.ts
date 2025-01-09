import { Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';

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
  async getAddresses(
    @Query('descriptor') descriptor: string,
  ): Promise<{ externalAddresses: string[]; internalAddresses: string[] }> {
    try {
      return await this.addressService.getAddresses(descriptor);
    } catch (error) {
      throw error;
    }
  }
}
