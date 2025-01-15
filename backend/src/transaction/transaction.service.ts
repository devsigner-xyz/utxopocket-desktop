import { Injectable } from '@nestjs/common';
import { TxAttribution } from '@bitcoinerlab/discovery';
import { Transaction, address } from 'bitcoinjs-lib';
import { NodeService } from '@node/node.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { LogService } from '@common/log/log.service';
import { TransactionPart } from '@common/interfaces/types';
import { UtilsService } from '@common/utils/utils.service';
import { Descriptor } from '@descriptor/descriptor.value-object';

/**
 * Service responsible for managing wallet transactions.
 *
 * This service handles retrieving transaction histories, fetching detailed
 * transaction information, and enriching transaction data with additional
 * details such as inputs, outputs, fees, and timestamps.
 */
@Injectable()
export class TransactionService {
  /**
   * Creates an instance of TransactionService.
   *
   * @param nodeService Service responsible for managing node connections.
   * @param descriptorService Service responsible for descriptor operations.
   * @param discoveryService Service responsible for discovering wallet information.
   * @param logger Service responsible for logging information and errors.
   */
  constructor(
    private readonly nodeService: NodeService,
    private readonly descriptorService: DescriptorService,
    private readonly discoveryService: DiscoveryService,
    private readonly logger: LogService,
  ) {}

  /**
   * Retrieves the transaction history for the wallet associated with a descriptor.
   *
   * This method ensures a connection to the Electrum node, validates the provided
   * descriptor, derives the necessary descriptors for external and internal addresses,
   * and then fetches the transaction history using the DiscoveryService. It enriches
   * each transaction with detailed input and output information, calculates fees,
   * and appends timestamps based on block heights.
   *
   * @param baseDescriptor - The wallet descriptor used to generate or retrieve the transaction history.
   * @returns An object containing an array of detailed transactions.
   *
   * @throws {HttpException} Throws a BAD_REQUEST error if the descriptor validation fails.
   * @throws {Error} Throws an INTERNAL_SERVER_ERROR if there is an issue fetching the transaction history.
   */
  async getTransactionHistory(
    baseDescriptor: string,
  ): Promise<{ transactions: any[] }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();
    const network = this.nodeService.getNetwork();

    const descriptor = Descriptor.create(baseDescriptor);

    // Obtain the discovery instance for the provided descriptor
    const discovery =
      await this.discoveryService.getDiscoveryInstance(descriptor);
    const { externalDescriptor, internalDescriptor } =
      descriptor.deriveDescriptors();

    // Fetch the transaction history using the discovery instance
    const history = discovery.getHistory(
      { descriptors: [externalDescriptor, internalDescriptor] },
      true,
    ) as TxAttribution[];

    // Extract unique block heights to fetch their timestamps
    const uniqueBlockHeights = Array.from(
      new Set(history.map((tx) => tx.blockHeight).filter((height) => height)),
    );

    const blockHeightToTimestamp: Record<number, number | null> = {};
    await Promise.all(
      uniqueBlockHeights.map(async (blockHeight) => {
        const timestamp = await this.getBlockTimestamp(blockHeight);
        blockHeightToTimestamp[blockHeight] = timestamp;
      }),
    );

    // Enrich each transaction with detailed information
    const detailedHistory = await Promise.all(
      history.map(async (tx) => {
        const txHex = discovery.getTxHex({ txId: tx.txId });
        const transaction = Transaction.fromHex(txHex);
        const inputs = await this.enrichTransactionInputs(transaction);

        const outputs = transaction.outs.map((output, index) => {
          const scriptPubKey = output.script.toString('hex');
          const value = output.value;

          const isOpReturn = output.script[0] === 0x6a;
          const addressString = isOpReturn
            ? null
            : address.fromOutputScript(output.script, network);

          return {
            index,
            value,
            scriptPubKey,
            address: addressString,
          };
        });

        const fee =
          inputs.reduce((sum, input) => sum + input.value, 0) -
          outputs.reduce((sum, output) => sum + output.value, 0);

        const timestamp = tx.blockHeight
          ? blockHeightToTimestamp[tx.blockHeight] || null
          : null;

        return {
          ...tx,
          inputs,
          outputs,
          fee,
          hex: txHex,
          timestamp,
          blockHeight: tx.blockHeight || null,
        };
      }),
    );

    return { transactions: detailedHistory };
  }

  /**
   * Retrieves the details of a specific transaction.
   *
   * This method ensures a connection to the Electrum node, retrieves the stored wallet descriptor,
   * validates it, and fetches the transaction details using the DiscoveryService. It enriches
   * the transaction with input and output details, calculates fees, parses transaction parts,
   * and appends timestamps based on block heights.
   *
   * @param txid - The transaction ID of the transaction to retrieve details for.
   * @returns An object containing detailed information about the specified transaction.
   *
   * @throws {Error} Throws an error if there is no stored wallet descriptor.
   * @throws {Error} Throws an error if the transaction is not found in the wallet history.
   * @throws {Error} Throws an error if there is an issue fetching transaction details.
   */
  async getTransactionDetails(txid: string): Promise<any> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();

    // Retrieve the stored wallet descriptor
    const storedDescriptor = await this.descriptorService.getStoredDescriptor();
    if (!storedDescriptor) {
      this.logger.error('No wallet descriptor found.');
      throw new Error('No wallet descriptor found.');
    }

    // Obtain the discovery instance for the stored descriptor
    const discovery =
      await this.discoveryService.getDiscoveryInstance(storedDescriptor);

    const { externalDescriptor, internalDescriptor } =
      storedDescriptor.deriveDescriptors();

    // Fetch the transaction history using the discovery instance
    const history = discovery.getHistory(
      { descriptors: [externalDescriptor, internalDescriptor] },
      true,
    ) as TxAttribution[];

    // Find the specific transaction in the history
    const transactionDetails = history.find((tx) => tx.txId === txid);
    if (!transactionDetails) {
      throw new Error('Transaction not found in wallet history.');
    }

    // Retrieve the raw transaction hex
    const txHex = discovery.getTxHex({ txId: txid });
    const tx = Transaction.fromHex(txHex);

    // Enrich inputs and outputs with detailed information
    const inputs = await this.enrichTransactionInputs(tx);
    const outputs = this.enrichTransactionOutputs(tx);

    // Calculate transaction fee
    const fee =
      inputs.reduce((sum, input) => sum + input.value, 0) -
      outputs.reduce((sum, output) => sum + output.value, 0);

    // Parse transaction parts for detailed breakdown
    const transactionParts = this.parseTransactionParts(txHex);

    // Retrieve the timestamp based on block height
    let timestamp = null;
    if (transactionDetails.blockHeight) {
      timestamp = await this.getBlockTimestamp(transactionDetails.blockHeight);
    }

    // Construct the detailed transaction object
    const transaction = {
      txId: txid,
      size: tx.virtualSize(),
      weight: tx.weight(),
      version: tx.version,
      locktime: tx.locktime,
      blockHeight: transactionDetails.blockHeight || null,
      timestamp,
      inputs,
      outputs,
      fee,
      hex: txHex,
      parts: transactionParts,
    };
    this.logger.log(`Transaction details retrieved for ${txid}`);
    return transaction;
  }

  /**
   * Enriches the inputs of a transaction with detailed information.
   *
   * This method fetches the previous transactions for each input to retrieve
   * values and addresses associated with the inputs.
   *
   * @param tx - The transaction whose inputs are to be enriched.
   * @returns An array of enriched input objects.
   *
   * @throws {Error} Throws an error if there is an issue fetching previous transactions.
   */
  private async enrichTransactionInputs(tx: Transaction): Promise<any[]> {
    const electrumExplorer = this.nodeService.getElectrumExplorer();
    const network = this.nodeService.getNetwork();

    return Promise.all(
      tx.ins.map(async (input) => {
        const prevTxId = Buffer.from(input.hash).reverse().toString('hex');
        const prevTxHex = await electrumExplorer.fetchTx(prevTxId);
        const prevTx = Transaction.fromHex(prevTxHex);
        const prevOutput = prevTx.outs[input.index];

        return {
          txid: prevTxId,
          index: input.index,
          value: prevOutput.value,
          script: prevOutput.script.toString('hex'),
          address: address.fromOutputScript(prevOutput.script, network),
        };
      }),
    );
  }

  /**
   * Enriches the outputs of a transaction with detailed information.
   *
   * This method parses each output to determine associated addresses and formats
   * the output data accordingly.
   *
   * @param tx - The transaction whose outputs are to be enriched.
   * @returns An array of enriched output objects.
   */
  private enrichTransactionOutputs(tx: Transaction): any[] {
    const network = this.nodeService.getNetwork();

    return tx.outs.map((output, index) => {
      const scriptPubKey = output.script.toString('hex');
      const value = output.value;

      const isOpReturn = output.script[0] === 0x6a;
      const addressString = isOpReturn
        ? null
        : address.fromOutputScript(output.script, network);

      return {
        index,
        value,
        scriptPubKey,
        address: addressString,
      };
    });
  }

  /**
   * Parses the raw transaction hex into its constituent parts.
   *
   * This method breaks down the transaction hex into various components such as
   * version, inputs, outputs, witnesses, and locktime, providing a detailed
   * structure of the transaction.
   *
   * @param txHex - The raw transaction hex string.
   * @returns An array of transaction parts detailing each component of the transaction.
   */
  private parseTransactionParts(txHex: string): TransactionPart[] {
    try {
      const txBuffer = Buffer.from(txHex, 'hex');
      const tx = Transaction.fromHex(txHex);

      const parts: TransactionPart[] = [];
      let offset = 0;

      // Version (4 bytes)
      const versionBytes = txBuffer.slice(offset, offset + 4);
      const version = tx.version;
      parts.push({
        name: 'Version',
        value: version,
        bytes: versionBytes.toString('hex'),
      });
      offset += 4;

      // Check if it is a SegWit transaction (marker and flag)
      let hasWitnesses = false;
      if (txBuffer[offset] === 0x00 && txBuffer[offset + 1] === 0x01) {
        hasWitnesses = true;
        const markerAndFlag = txBuffer.slice(offset, offset + 2);
        parts.push({
          name: 'Marker and Flag',
          value: markerAndFlag.toString('hex'),
          bytes: markerAndFlag.toString('hex'),
        });
        offset += 2;
      }

      // Input count (varint)
      const varintInput = UtilsService.readVarInt(txBuffer, offset);
      const vinLen = varintInput.number;
      const vinBytesLen = varintInput.size;
      parts.push({
        name: 'Input count',
        value: vinLen,
        bytes: txBuffer.slice(offset, offset + vinBytesLen).toString('hex'),
      });
      offset += vinBytesLen;

      // Inputs
      for (let i = 0; i < tx.ins.length; i++) {
        const inputStartOffset = offset;

        // TxID (32 bytes)
        const txidBytes = txBuffer.slice(offset, offset + 32);
        const txid = Buffer.from(txidBytes).reverse().toString('hex');
        offset += 32;

        // Vout (4 bytes)
        const voutBytes = txBuffer.slice(offset, offset + 4);
        const vout = txBuffer.readUInt32LE(offset);
        offset += 4;

        // Script Length (varint)
        const scriptLengthVarint = UtilsService.readVarInt(txBuffer, offset);
        const scriptLength = scriptLengthVarint.number;
        const scriptLengthBytesLen = scriptLengthVarint.size;
        offset += scriptLengthBytesLen;

        // ScriptSig
        const scriptSigBytes = txBuffer.slice(offset, offset + scriptLength);
        const scriptSig = scriptSigBytes.toString('hex');
        offset += scriptLength;

        // Sequence (4 bytes)
        const sequenceBytes = txBuffer.slice(offset, offset + 4);
        const sequence = txBuffer.readUInt32LE(offset);
        offset += 4;

        const inputEndOffset = offset;
        const inputBytes = txBuffer
          .slice(inputStartOffset, inputEndOffset)
          .toString('hex');

        parts.push({
          name: `Input ${i}`,
          txid: txid,
          vout: vout,
          scriptSig: scriptSig,
          sequence: sequence,
          bytes: inputBytes,
        });
      }

      // Output count (varint)
      const varintOutput = UtilsService.readVarInt(txBuffer, offset);
      const voutLen = varintOutput.number;
      const voutBytesLen = varintOutput.size;
      parts.push({
        name: 'Output count',
        value: voutLen,
        bytes: txBuffer.slice(offset, offset + voutBytesLen).toString('hex'),
      });
      offset += voutBytesLen;

      // Outputs
      for (let i = 0; i < tx.outs.length; i++) {
        const outputStartOffset = offset;

        // Value (8 bytes)
        const valueBytes = txBuffer.slice(offset, offset + 8);
        const value = parseInt(
          Buffer.from(valueBytes).reverse().toString('hex'),
          16,
        );
        offset += 8;

        // Script Length (varint)
        const scriptLengthVarint = UtilsService.readVarInt(txBuffer, offset);
        const scriptLength = scriptLengthVarint.number;
        const scriptLengthBytesLen = scriptLengthVarint.size;
        offset += scriptLengthBytesLen;

        // ScriptPubKey
        const scriptPubKeyBytes = txBuffer.slice(offset, offset + scriptLength);
        const scriptPubKey = scriptPubKeyBytes.toString('hex');
        offset += scriptLength;

        const outputEndOffset = offset;
        const outputBytes = txBuffer
          .slice(outputStartOffset, outputEndOffset)
          .toString('hex');

        parts.push({
          name: `Output ${i}`,
          value: value,
          scriptPubKey: scriptPubKey,
          bytes: outputBytes,
        });
      }

      // Witness data (if applicable)
      if (hasWitnesses) {
        for (let i = 0; i < tx.ins.length; i++) {
          const witness = tx.ins[i].witness;
          const witnessBytes = witness.map((w) => w.toString('hex')).join(' ');
          parts.push({
            name: `Witness ${i}`,
            witness: witnessBytes,
            bytes: witnessBytes,
          });
        }
      }

      // Locktime (4 bytes)
      const locktimeBytes = txBuffer.slice(offset, offset + 4);
      const locktime = tx.locktime;
      parts.push({
        name: 'Locktime',
        value: locktime,
        bytes: locktimeBytes.toString('hex'),
      });
      offset += 4;

      return parts;
    } catch (error) {
      console.error('Error parsing transaction:', error);
      return [];
    }
  }

  /**
   * Retrieves the timestamp of a block given its height.
   *
   * This method fetches the block status using the Electrum explorer and extracts the
   * block timestamp. If the block status does not provide the timestamp, it returns `null`.
   *
   * @param blockHeight - The height of the block for which to retrieve the timestamp.
   * @returns The timestamp of the block in Unix time or `null` if not available.
   *
   * @throws {Error} Throws an error if the Electrum Explorer is not connected.
   * @throws {Error} Throws an error if there is an issue fetching the block status.
   */
  async getBlockTimestamp(blockHeight: number): Promise<number | null> {
    const electrumExplorer = this.nodeService.getElectrumExplorer();
    if (!electrumExplorer) {
      this.logger.error('Electrum Explorer not connected');
      throw new Error('Electrum Explorer not connected');
    }

    const blockStatus = await electrumExplorer.fetchBlockStatus(blockHeight);

    if (blockStatus && blockStatus.blockTime) {
      return blockStatus.blockTime;
    }

    return null;
  }
}
