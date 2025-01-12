import {
  Controller,
  Get,
  UseInterceptors,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { WalletService } from '@wallet/wallet.service';
import { UTXO } from '@common/interfaces/types';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { WalletResponseDto } from './dto/wallet.response.dto';

/**
 * Controller responsible for handling wallet-related HTTP requests.
 *
 * This controller provides endpoints to retrieve comprehensive wallet information,
 * including balance, UTXOs, transaction history, and associated addresses.
 */
@Controller('wallet')
export class WalletController {
  /**
   * Creates an instance of WalletController.
   *
   * @param walletService Service responsible for aggregating wallet information.
   */
  constructor(private readonly walletService: WalletService) {}

  /**
   * Retrieves comprehensive wallet information.
   *
   * This endpoint accepts a wallet descriptor as a query parameter and returns
   * detailed information about the wallet, including balance, UTXOs, transactions,
   * external addresses, and internal addresses. It utilizes caching to optimize
   * performance for repeated requests.
   *
   * @param descriptor - The wallet descriptor used to generate or retrieve wallet information.
   * @returns An object containing the wallet's balance, UTXOs, transactions, external addresses, and internal addresses.
   *
   * @throws {HttpException} Throws a BAD_REQUEST error if the descriptor is not provided.
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if there is an issue retrieving the wallet information.
   */
  @UseInterceptors(CacheInterceptor)
  @Get('info')
  @ApiOperation({ summary: 'Get wallet information' })
  @ApiParam({
    name: 'descriptor',
    description:
      'The wallet descriptor used to generate or retrieve wallet information',
  })
  @ApiResponse({ status: 200, type: WalletResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getWalletInfo(
    @Query('descriptor') descriptor: string,
  ): Promise<WalletResponseDto> {
    if (!descriptor) {
      throw new HttpException('Descriptor is required', HttpStatus.BAD_REQUEST);
    }
    try {
      // Delegate the retrieval of wallet information to the WalletService
      return await this.walletService.getWalletInfo(descriptor);
    } catch (error) {
      // Log the error and throw an HTTP exception for the client
      throw new HttpException(
        error.message || 'Failed to retrieve wallet information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
