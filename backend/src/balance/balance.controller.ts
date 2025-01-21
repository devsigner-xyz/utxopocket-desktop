import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BalanceService } from '@balance/balance.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BalanceResponseDto } from './dto/balance.response.dto';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';

/**
 * Controller responsible for handling wallet balance-related HTTP requests.
 */
@Controller('balance')
export class BalanceController {
  /**
   * Creates an instance of BalanceController.
   *
   * @param balanceService Service responsible for retrieving wallet balances.
   */
  constructor(private readonly balanceService: BalanceService) {}

  /**
   * Retrieves the wallet balance based on the provided descriptor.
   *
   * This endpoint accepts a wallet descriptor as a query parameter and returns
   * the total balance associated with that descriptor. It leverages the
   * BalanceService to perform the balance retrieval.
   *
   * @param descriptor - The descriptor used to generate or retrieve the wallet balance.
   * @returns An object containing the wallet balance.
   *
   * @throws {Error} Throws an error if the balance retrieval operation fails.
   */
  @Get('balance')
  @ApiOperation({
    summary: 'Get the balance of a wallet associated with a descriptor',
  })
  @ApiResponse({ status: 200, type: BalanceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBalance(
    @Query() descriptorRequestDto: DescriptorRequestDto,
  ): Promise<BalanceResponseDto> {
    try {
      return await this.balanceService.getBalance(
        descriptorRequestDto.descriptor,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve wallet information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
