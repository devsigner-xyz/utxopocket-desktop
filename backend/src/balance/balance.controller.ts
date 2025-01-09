import { Controller, Get, Query } from '@nestjs/common';
import { BalanceService } from '@balance/balance.service';

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
  async getBalance(
    @Query('descriptor') descriptor: string,
  ): Promise<{ balance: number }> {
    try {
      return await this.balanceService.getBalance(descriptor);
    } catch (error) {
      throw error;
    }
  }
}
