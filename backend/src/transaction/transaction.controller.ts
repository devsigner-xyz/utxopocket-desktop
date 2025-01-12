import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TransactionHistoryResponseDto } from './dto/transaction-history.response.dto';

/**
 * Controller responsible for handling wallet transaction-related HTTP requests.
 *
 * This controller provides endpoints to retrieve transaction histories and fetch
 * detailed information about specific transactions. It leverages the `TransactionService`
 * to perform the underlying operations.
 */
@Controller('transaction')
export class TransactionController {
  /**
   * Creates an instance of TransactionController.
   *
   * @param transactionService Service responsible for managing wallet transactions.
   */
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Retrieves the transaction history for the wallet associated with a descriptor.
   *
   * This endpoint accepts a wallet descriptor as a query parameter and returns
   * a detailed history of transactions associated with that descriptor. It leverages
   * the `TransactionService` to fetch and enrich the transaction data.
   *
   * @param descriptor - The wallet descriptor used to generate or retrieve the transaction history.
   * @returns An object containing an array of detailed transactions.
   *
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if there is an issue fetching the transaction history.
   */
  @Get('history')
  @ApiOperation({
    summary:
      'Get transaction history for a wallet associated with a descriptor',
  })
  @ApiParam({
    name: 'descriptor',
    description:
      'The wallet descriptor used to generate or retrieve the transaction history',
  })
  @ApiResponse({ status: 200, type: TransactionHistoryResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTransactionHistory(
    @Query('descriptor') descriptor: string,
  ): Promise<TransactionHistoryResponseDto> {
    try {
      return await this.transactionService.getTransactionHistory(descriptor);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve transaction history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves the details of a specific transaction.
   *
   * This endpoint accepts a transaction ID (txid) in the request body and returns
   * detailed information about the specified transaction, including inputs, outputs,
   * fees, timestamps, and a breakdown of the transaction parts.
   *
   * @param txid - The transaction ID of the transaction to retrieve details for.
   * @returns An object containing detailed information about the specified transaction.
   *
   * @throws {HttpException} Throws a BAD_REQUEST error if the transaction ID is not provided.
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if there is an issue fetching the transaction details.
   */
  @Post('transaction-details')
  @ApiOperation({
    summary:
      'Get transaction details for a transaction associated with a descriptor',
  })
  @ApiParam({
    name: 'txid',
    description:
      'The transaction ID of the transaction to retrieve details for',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTransactionDetails(@Body('txid') txid: string): Promise<any> {
    if (!txid) {
      throw new HttpException(
        'Transaction ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const transactionDetails =
        await this.transactionService.getTransactionDetails(txid);

      return transactionDetails;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve transaction details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
