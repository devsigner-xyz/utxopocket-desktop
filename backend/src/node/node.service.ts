import { Injectable } from '@nestjs/common';
import { Network } from 'bitcoinjs-lib';
import { ElectrumService } from '@electrum/electrum.service';

/**
 * Service responsible for managing Electrum node connections and interactions.
 *
 * This service acts as an intermediary between the controllers and the `ElectrumService`,
 * providing methods to connect to and disconnect from Electrum nodes, ensure connections,
 * and retrieve network and explorer information.
 */
@Injectable()
export class NodeService {
  /**
   * Creates an instance of NodeService.
   *
   * @param electrumService Service responsible for managing Electrum node connections.
   */
  constructor(private readonly electrumService: ElectrumService) {}

  /**
   * Connects to an Electrum node with the specified parameters.
   *
   * This method delegates the connection process to the `ElectrumService`, providing the
   * necessary host, port, SSL, and network parameters to establish the connection.
   *
   * @param host - The hostname or IP address of the Electrum server.
   * @param port - The port number of the Electrum server.
   * @param ssl - Whether to use SSL for the connection.
   * @param network - The Bitcoin network to connect to ('mainnet' or 'testnet').
   * @returns A promise that resolves to an object containing a confirmation message and the URI of the connected node.
   *
   * @throws {Error} Throws an error if the connection to the Electrum node fails.
   */
  connectNode(
    host: string,
    port: number,
    ssl: boolean,
    network: 'mainnet' | 'testnet',
  ): Promise<{ message: string; node: string }> {
    return this.electrumService.connect(host, port, ssl, network);
  }

  /**
   * Disconnects from the currently connected Electrum node.
   *
   * This method delegates the disconnection process to the `ElectrumService`, ensuring
   * that the connection is gracefully terminated.
   *
   * @returns A promise that resolves to an object containing a confirmation message upon successful disconnection.
   *
   * @throws {Error} Throws an error if there is no active Electrum connection to disconnect.
   */
  disconnectNode(): Promise<{ message: string }> {
    return this.electrumService.disconnect();
  }

  /**
   * Ensures that there is an established connection to Electrum before proceeding.
   *
   * This method checks if there is an active connection to an Electrum node. If not, it attempts
   * to reconnect using previously stored connection parameters. This is useful for operations
   * that require a stable Electrum connection.
   *
   * @returns A promise that resolves when the connection is ensured.
   *
   * @throws {Error} Throws an error if reconnection parameters are unavailable or if reconnection fails.
   */
  ensureElectrumConnection(): Promise<void> {
    return this.electrumService.ensureConnection();
  }

  /**
   * Retrieves the current `ElectrumExplorer` instance.
   *
   * This method provides access to the `ElectrumExplorer` instance managed by the `ElectrumService`,
   * allowing for direct interactions with the Electrum server if necessary.
   *
   * @returns The `ElectrumExplorer` instance if connected, otherwise `null`.
   */
  getElectrumExplorer() {
    return this.electrumService.getExplorer();
  }

  /**
   * Retrieves the current Bitcoin network configuration.
   *
   * This method returns the network configuration (e.g., mainnet, testnet) that is currently
   * being used by the `ElectrumService`. This is useful for ensuring that operations are
   * performed on the correct network.
   *
   * @returns The `Network` instance representing the current Bitcoin network.
   */
  getNetwork(): Network {
    return this.electrumService.getNetwork();
  }
}
