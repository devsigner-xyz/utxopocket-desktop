import { Injectable } from '@nestjs/common';
import { BalanceService } from '@balance/balance.service';
import { UtxoService } from '@utxo/utxo.service';
import { TransactionService } from '@transaction/transaction.service';
import { AddressService } from '@address/address.service';
import { WalletDto } from './dto/wallet.dto';

/**
 * Service responsible for aggregating comprehensive wallet information.
 *
 * This service integrates multiple sub-services to provide a complete overview of
 * a wallet's state, including balance, UTXOs, transaction history, and associated addresses.
 */
@Injectable()
export class WalletService {
  /**
   * Creates an instance of WalletService.
   *
   * @param balanceService Service responsible for retrieving wallet balances.
   * @param utxoService Service responsible for managing Unspent Transaction Outputs (UTXOs).
   * @param transactionService Service responsible for handling wallet transactions.
   * @param addressService Service responsible for managing wallet addresses.
   */
  constructor(
    private readonly balanceService: BalanceService,
    private readonly utxoService: UtxoService,
    private readonly transactionService: TransactionService,
    private readonly addressService: AddressService,
  ) {}

  /**
   * Obtains complete wallet information.
   *
   * This method concurrently retrieves the wallet's balance, UTXOs, transaction history,
   * and both external and internal addresses. It aggregates the data into a single
   * comprehensive response, providing a holistic view of the wallet's state.
   *
   * @param descriptor - The wallet descriptor used to generate or retrieve wallet information.
   * @returns An object containing the wallet's balance, UTXOs, transactions, external addresses, and internal addresses.
   *
   * @throws {Error} Throws an error if any of the underlying services fail to retrieve their respective data.
   */
  async getWalletInfo(descriptor: string): Promise<WalletDto> {
    try {
      // Concurrently fetch balance, UTXOs, transactions, and addresses
      const [balanceResult, utxosResult, transactionsResult, addressesResult] =
        await Promise.all([
          this.balanceService.getBalance(descriptor),
          this.utxoService.getUtxos(descriptor),
          this.transactionService.getTransactionHistory(descriptor),
          this.addressService.getAddresses(descriptor),
        ]);

      // Aggregate and return the comprehensive wallet information
      return {
        balance: balanceResult.balance,
        utxos: utxosResult.utxos,
        transactions: transactionsResult.transactions,
        externalAddresses: addressesResult.externalAddresses,
        internalAddresses: addressesResult.internalAddresses,
      };
    } catch (error) {
      // Log the error and rethrow for higher-level handling
      throw new Error(
        `Failed to retrieve wallet information: ${error.message}`,
      );
    }
  }
}
