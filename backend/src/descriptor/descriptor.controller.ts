import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DescriptorService } from './descriptor.service';

/**
 * Controller responsible for managing wallet descriptor operations.
 */
@Controller('descriptor')
export class DescriptorController {
  /**
   * Creates an instance of DescriptorController.
   *
   * @param descriptorService Service responsible for descriptor operations.
   */
  constructor(private readonly descriptorService: DescriptorService) {}

  /**
   * Loads a wallet based on the provided descriptor and optional gap limit.
   *
   * This endpoint accepts a wallet descriptor and an optional gap limit in the request body,
   * validates the descriptor, and loads the wallet accordingly.
   *
   * @param descriptor - The wallet descriptor to load.
   * @param gapLimit - Optional gap limit for address discovery. Defaults to 100 if not provided.
   * @returns An object containing a success message upon successful wallet loading.
   *
   * @throws {HttpException} Throws an error if the wallet loading operation fails.
   */
  @Post('load')
  async loadWallet(
    @Body('descriptor') descriptor: string,
    @Body('gapLimit') gapLimit?: number,
  ): Promise<{ message: string }> {
    try {
      const result = await this.descriptorService.loadWallet(
        descriptor,
        gapLimit,
      );
      return { message: 'Wallet loaded successfully.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieves the list of supported descriptor types.
   *
   * This endpoint provides information about the descriptor types that are supported
   * by the system, assisting clients in understanding which descriptors can be used.
   *
   * @returns An object containing an array of supported descriptor types.
   */
  @Get('types')
  getSupportedDescriptorTypes() {
    return {
      supportedTypes: ['pk()', 'pkh()', 'wpkh()', 'sh(wpkh())'],
    };
  }

  /**
   * Validates a given wallet descriptor.
   *
   * This endpoint accepts a wallet descriptor in the request body, validates its format
   * and type, and returns the validation result along with the descriptor type if valid.
   *
   * @param descriptor - The wallet descriptor to validate.
   * @returns An object indicating whether the descriptor is valid and its type if valid.
   */
  @Post('validate')
  async validateDescriptor(@Body('descriptor') descriptor: string) {
    const validation =
      await this.descriptorService.validateDescriptor(descriptor);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
      };
    }
    const descriptorType = this.descriptorService.getDescriptorType(descriptor);
    return {
      isValid: true,
      type: descriptorType,
    };
  }
}
