import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NodeService } from '@node/node.service';

/**
 * Service responsible for managing block-related operations.
 */
@Injectable()
export class BlockService {
  /**
   * Creates an instance of BlockService.
   *
   * @param nodeService Service responsible for managing node connections.
   */
  constructor(private readonly nodeService: NodeService) {}

  /**
   * Polls the current block periodically to detect new blocks.
   *
   * This method establishes a connection to the Electrum node and periodically checks
   * for new blocks by comparing the current block height with the previous one. If a
   * new block is detected, it emits the block status through the returned Observable.
   *
   * @returns An Observable that emits the new block status when a new block is detected.
   *
   * @throws {Error} Emits an error if there is an issue fetching the block status.
   */
  pollBlocks(): Observable<any> {
    return new Observable((subscriber) => {
      let previousBlockHeight = -1;
      const electrumExplorer = this.nodeService.getElectrumExplorer();

      /**
       * Fetches the current block height and compares it with the previous height.
       * If a new block is detected, emits the block status.
       */
      const fetchBlock = async () => {
        try {
          await this.nodeService.ensureElectrumConnection();
          const currentBlockHeight = await electrumExplorer.fetchBlockHeight();

          if (currentBlockHeight !== previousBlockHeight) {
            previousBlockHeight = currentBlockHeight;
            const blockStatus =
              await electrumExplorer.fetchBlockStatus(currentBlockHeight);
            subscriber.next(blockStatus);
          }
        } catch (error) {
          subscriber.error(error);
        }
      };

      // Initial fetch to set the starting block height
      fetchBlock().catch((error) => subscriber.error(error));

      // Set up polling at 5-second intervals
      const pollingInterval = setInterval(() => {
        fetchBlock().catch((error) => subscriber.error(error));
      }, 5000);

      // Cleanup function to clear the polling interval when unsubscribed
      return () => {
        clearInterval(pollingInterval);
      };
    });
  }

  /**
   * Retrieves the timestamp of a block given its height.
   *
   * This method fetches the block status using the Electrum explorer and extracts the
   * block timestamp. If the block status does not provide the timestamp, it retrieves
   * the block header and parses the timestamp from it.
   *
   * @param blockHeight - The height of the block for which to retrieve the timestamp.
   * @returns The timestamp of the block in Unix time or `null` if not available.
   *
   * @throws {Error} Throws an error if the Electrum explorer or client is not connected.
   * @throws {Error} Throws an error if the block header cannot be retrieved.
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
