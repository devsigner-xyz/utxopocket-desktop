import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Transaction, address } from 'bitcoinjs-lib';
import { TxAttribution } from '@bitcoinerlab/discovery';
import { NodeService } from '@node/node.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { AddressService } from '@address/address.service';
import { UTXO } from '@common/interfaces/types';
import { Descriptor } from '@descriptor/descriptor.value-object';

/**
 * Service responsible for managing Unspent Transaction Outputs (UTXOs).
 *
 * This service handles retrieving UTXOs for a given wallet descriptor, determining
 * whether addresses are change addresses or reused, and fetching block timestamps.
 */
@Injectable()
export class UtxoService {
  /**
   * Creates an instance of UtxoService.
   *
   * @param nodeService Service responsible for managing node connections.
   * @param discoveryService Service responsible for discovering wallet information.
   * @param addressService Service responsible for managing address derivations.
   */
  constructor(
    private readonly nodeService: NodeService,
    private readonly discoveryService: DiscoveryService,
    private readonly addressService: AddressService,
  ) {}

  /**
   * Retrieves the UTXOs for a wallet descriptor.
   *
   * This method ensures a connection to the Electrum node, validates the provided
   * descriptor, derives the necessary descriptors for external and internal addresses,
   * and then fetches the UTXOs using the DiscoveryService. It enriches each UTXO with
   * detailed information, including whether it's a change address, reused, locked, and
   * appends timestamps based on block heights.
   *
   * @param baseDescriptor - The wallet descriptor used to generate or retrieve UTXOs.
   * @returns An object containing an array of UTXOs.
   *
   * @throws {HttpException} Throws a BAD_REQUEST error if the descriptor validation fails.
   * @throws {Error} Throws an INTERNAL_SERVER_ERROR if there is an issue fetching the UTXOs.
   */
  async getUtxos(baseDescriptor: string): Promise<{ utxos: UTXO[] }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();

    const network = this.nodeService.getNetwork();
    const descriptor = Descriptor.create(baseDescriptor);

    // Obtain the discovery instance for the provided descriptor
    const discovery =
      await this.discoveryService.getDiscoveryInstance(descriptor);
    const { externalDescriptor, internalDescriptor } =
      descriptor.deriveDescriptors();

    // Fetch the UTXOs using the discovery instance
    const utxosSet = discovery.getUtxos({
      descriptors: [externalDescriptor, internalDescriptor],
    });

    // Fetch the transaction history to map txid to block heights
    const history = discovery.getHistory(
      { descriptors: [externalDescriptor, internalDescriptor] },
      true,
    ) as TxAttribution[];
    const txIdToBlockHeight: Record<string, number> = {};
    history.forEach((tx) => {
      if (tx.blockHeight) {
        txIdToBlockHeight[tx.txId] = tx.blockHeight;
      }
    });

    const utxos: UTXO[] = [];
    for (const utxoString of Array.from(utxosSet)) {
      const [txid, voutStr] = utxoString.split(':');
      const vout = parseInt(voutStr, 10);
      const txHex = discovery.getTxHex({ txId: txid });
      const tx = Transaction.fromHex(txHex);
      const output = tx.outs[vout];
      const scriptPubKey = output.script.toString('hex');
      const value = output.value;
      const addressString = address.fromOutputScript(output.script, network);
      const height = txIdToBlockHeight[txid] || null;
      let timestamp: number | null = null;
      if (height !== null) {
        timestamp = await this.getBlockTimestamp(height);
      }
      const isUtxoChange = this.isChangeAddress(
        addressString,
        internalDescriptor,
      );
      const isReused = await this.isAddressReused(addressString);
      const locked = isUtxoChange || isReused;
      utxos.push({
        txid,
        vout,
        value,
        scriptPubKey,
        address: addressString,
        height,
        timestamp,
        locked,
        isReused,
        isUtxoChange,
      } as UTXO);
    }

    return { utxos };
  }

  /**
   * Determines whether a given address is a change address.
   *
   * @param address - The address to evaluate.
   * @param internalDescriptor - The internal descriptor used to derive change addresses.
   * @returns `true` if the address is a change address, `false` otherwise.
   */
  private isChangeAddress(
    address: string,
    internalDescriptor: string,
  ): boolean {
    const derivedAddresses =
      this.addressService.getDerivedAddresses(internalDescriptor);
    return derivedAddresses.includes(address);
  }

  /**
   * Determines whether a given address has been reused.
   *
   * @param address - The address to evaluate.
   * @returns `true` if the address has been reused, `false` otherwise.
   *
   * @throws {Error} Throws an error if there is an issue ensuring Electrum connection.
   */
  private async isAddressReused(address: string): Promise<boolean> {
    await this.nodeService.ensureElectrumConnection();
    const txCount = await this.fetchTransactionHistoryForAddress(address);
    return txCount > 1;
  }

  /**
   * Fetches the transaction history count for a specific address.
   *
   * @param address - The address for which to fetch the transaction history.
   * @returns The number of transactions associated with the address.
   *
   * @throws {Error} Throws an error if the Electrum Explorer is not connected.
   */
  private async fetchTransactionHistoryForAddress(
    address: string,
  ): Promise<number> {
    const electrumExplorer = this.nodeService.getElectrumExplorer();
    if (!electrumExplorer) {
      throw new Error('Electrum Explorer not connected');
    }
    const history = await electrumExplorer.fetchTxHistory({ address });
    return history.length;
  }

  /**
   * Retrieves the timestamp of a block given its height.
   *
   * This method fetches the block status using the Electrum explorer and extracts the
   * block timestamp. If the block status does not provide the timestamp, it attempts
   * to fetch the block header to extract the timestamp. If both methods fail, it returns `null`.
   *
   * @param blockHeight - The height of the block for which to retrieve the timestamp.
   * @returns The timestamp of the block in Unix time or `null` if not available.
   *
   * @throws {Error} Throws an error if the Electrum Explorer is not connected or if there is an issue fetching the block status.
   */
  async getBlockTimestamp(blockHeight: number): Promise<number | null> {
    const electrumExplorer = this.nodeService.getElectrumExplorer();
    if (!electrumExplorer) {
      throw new Error('Electrum Explorer not connected');
    }

    const blockStatus = await electrumExplorer.fetchBlockStatus(blockHeight);
    if (blockStatus && blockStatus.blockTime) {
      return blockStatus.blockTime;
    }

    const client = (electrumExplorer as any).client;
    if (!client) {
      throw new Error('Electrum client not available');
    }

    const blockHeaderHex = await client.request('blockchain.block.header', [
      blockHeight,
      0,
    ]);
    if (!blockHeaderHex) {
      return null;
    }

    const blockHeaderBuffer = Buffer.from(blockHeaderHex, 'hex');
    return blockHeaderBuffer.readUInt32LE(68);
  }
}
