import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DescriptorService } from './descriptor.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoadWalletResponseDto } from './dto/load-wallet.response.dto';
import { LoadWalletRequestDto } from './dto/load-wallet.request.dto';
import { SupportedDescriptorTypesResponseDto } from './dto/supported-descriptor-types.response.dto';
import { DescriptorType } from './enum/descryptor-type.enum';
import { ValidateDescriptorResponseDto } from './dto/validate-descriptor.response.dto';
import { Descriptor } from './descriptor.value-object';
import { ValidateDescriptorRequestDto } from './dto/validate-descriptor.request.dto';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';

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
  @ApiOperation({ summary: 'Load a wallet associated with a descriptor' })
  @ApiResponse({ status: 200, type: LoadWalletResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async loadWallet(
    @Body() loadWalletRequestDto: LoadWalletRequestDto,
  ): Promise<LoadWalletResponseDto> {
    try {
      const result = await this.descriptorService.loadWallet(
        loadWalletRequestDto.descriptor,
        loadWalletRequestDto.gapLimit,
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
  @ApiOperation({ summary: 'Get the list of supported descriptor types' })
  @ApiResponse({ status: 200, type: SupportedDescriptorTypesResponseDto })
  getSupportedDescriptorTypes() {
    return {
      supportedTypes: [
        DescriptorType.PK,
        DescriptorType.PKH,
        DescriptorType.WPKH,
        DescriptorType.SH_WPKH,
      ],
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
  @ApiOperation({ summary: 'Validate a wallet descriptor' })
  @ApiResponse({ status: 200, type: ValidateDescriptorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async validateDescriptor(@Body() descriptorRequestDto: DescriptorRequestDto) {
    try {
      const descriptor = Descriptor.create(descriptorRequestDto.descriptor);
      const { name, type } = descriptor;
      return {
        isValid: true,
        type,
        name,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }
}
