import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElectrumExplorer } from '@bitcoinerlab/explorer';
import { Network, networks } from 'bitcoinjs-lib';

/**
 * Service responsible for managing connections to Electrum nodes.
 *
 * This service handles establishing and maintaining connections to Electrum servers,
 * ensuring connectivity, and providing access to the ElectrumExplorer instance for
 * interacting with the blockchain network.
 */
@Injectable()
export class ElectrumService {
  /**
   * The ElectrumExplorer instance used to interact with the Electrum server.
   */
  private electrumExplorer: ElectrumExplorer | null = null;

  /**
   * The current Bitcoin network configuration.
   */
  private network: Network;

  /**
   * The host address of the connected Electrum server.
   */
  private electrumHost: string;

  /**
   * The port number of the connected Electrum server.
   */
  private electrumPort: number;

  /**
   * Indicates whether SSL is used for the Electrum connection.
   */
  private electrumSsl: boolean;

  /**
   * The network type of the connected Electrum server ('mainnet' or 'testnet').
   */
  private electrumNetwork: 'mainnet' | 'testnet';

  /**
   * Creates an instance of ElectrumService.
   *
   * @param configService Service for accessing environment configuration variables.
   */
  constructor(private readonly configService: ConfigService) {
    const networkName = this.configService.get<string>('BITCOIN_NETWORK');
    this.network =
      networkName === 'mainnet' ? networks.bitcoin : networks.testnet;
  }

  /**
   * Establishes a connection to an Electrum node.
   *
   * This method connects to the specified Electrum server using the provided host, port,
   * and SSL settings. It initializes the ElectrumExplorer instance for interacting with
   * the blockchain network.
   *
   * @param host - The hostname or IP address of the Electrum server.
   * @param port - The port number of the Electrum server.
   * @param ssl - Whether to use SSL for the connection.
   * @param network - The Bitcoin network to connect to ('mainnet' or 'testnet').
   * @returns An object containing a confirmation message and the URI of the connected node.
   *
   * @throws {Error} Throws an error if the Electrum API URI is invalid or connection parameters are incorrect.
   * @throws {Error} Throws an error if the connection to the Electrum node fails.
   */
  async connect(
    host: string,
    port: number,
    ssl: boolean,
    network: 'mainnet' | 'testnet',
  ): Promise<{ message: string; node: string }> {
    const protocol = ssl ? 'ssl' : 'tcp';
    const electrumURI = `${protocol}://${host}:${port}`;

    this.network = network === 'mainnet' ? networks.bitcoin : networks.testnet;

    this.electrumExplorer = new ElectrumExplorer({
      ...this.getElectrumParams(electrumURI),
      network: this.network,
    });

    try {
      await this.electrumExplorer.connect();
    } catch (error) {
      throw new Error(
        `Failed to connect to Electrum node at ${electrumURI}: ${error.message}`,
      );
    }

    this.electrumHost = host;
    this.electrumPort = port;
    this.electrumSsl = ssl;
    this.electrumNetwork = network;

    return {
      message: 'Connected to Electrum node.',
      node: electrumURI,
    };
  }

  /**
   * Parses the Electrum API URI to extract connection parameters.
   *
   * @param electrumAPI - The Electrum API URI in the format `<protocol>://<host>:<port>`.
   * @returns An object containing the protocol, host, and port extracted from the URI.
   *
   * @throws {Error} Throws an error if the Electrum API URI is invalid or missing required components.
   */
  private getElectrumParams(electrumAPI: string): {
    protocol: 'ssl' | 'tcp';
    host: string;
    port: number;
  } {
    const regex = /^(.*):\/\/([^:/]+)(?::(\d+))?/;
    const matches = electrumAPI.match(regex);

    if (!matches || matches.length < 3) {
      throw new Error(`Invalid Electrum API URI: ${electrumAPI}`);
    }

    const protocol = matches[1];
    const host = matches[2];
    const port = matches[3];

    if (!host) {
      throw new Error(`Invalid host in Electrum API URI: ${host}.`);
    }

    if (protocol !== 'ssl' && protocol !== 'tcp') {
      throw new Error(
        `Invalid protocol in Electrum API URI: ${protocol}. Expected 'ssl' or 'tcp'.`,
      );
    }

    if (!port || isNaN(Number(port))) {
      throw new Error(
        `Invalid or missing port in Electrum API URI: ${port}. Port must be a number.`,
      );
    }

    return {
      protocol: protocol as 'ssl' | 'tcp',
      host,
      port: Number(port),
    };
  }

  /**
   * Disconnects from the currently connected Electrum node.
   *
   * This method gracefully closes the connection to the Electrum server and resets
   * the ElectrumExplorer instance.
   *
   * @returns An object containing a confirmation message upon successful disconnection.
   *
   * @throws {Error} Throws an error if there is no active Electrum connection to disconnect.
   */
  async disconnect(): Promise<{ message: string }> {
    if (this.electrumExplorer) {
      try {
        await this.electrumExplorer.close();
        this.electrumExplorer = null;
        return { message: 'Disconnected from Electrum node.' };
      } catch (error) {
        throw new Error(
          `Failed to disconnect from Electrum node: ${error.message}`,
        );
      }
    } else {
      throw new Error('No active Electrum connection to disconnect.');
    }
  }

  /**
   * Ensures that a connection to the Electrum node is established.
   *
   * If there is no active connection, this method attempts to reconnect using the
   * previously stored connection parameters.
   *
   * @returns A promise that resolves when the connection is ensured.
   *
   * @throws {Error} Throws an error if reconnection parameters are unavailable or reconnection fails.
   */
  async ensureConnection(): Promise<void> {
    if (
      !this.electrumExplorer ||
      !(await this.electrumExplorer.isConnected())
    ) {
      if (
        this.electrumHost &&
        this.electrumPort !== undefined &&
        this.electrumSsl !== undefined &&
        this.electrumNetwork !== undefined
      ) {
        await this.connect(
          this.electrumHost,
          this.electrumPort,
          this.electrumSsl,
          this.electrumNetwork,
        );
      } else {
        throw new Error(
          'No Electrum connection parameters available to reconnect.',
        );
      }
    }
  }

  /**
   * Retrieves the current ElectrumExplorer instance.
   *
   * @returns The `ElectrumExplorer` instance if connected, otherwise `null`.
   */
  getExplorer(): ElectrumExplorer | null {
    return this.electrumExplorer;
  }

  /**
   * Checks whether the service is currently connected to an Electrum node.
   *
   * @returns A promise that resolves to `true` if connected, `false` otherwise.
   */
  async isConnected(): Promise<boolean> {
    if (this.electrumExplorer) {
      return await this.electrumExplorer.isConnected();
    } else {
      return false;
    }
  }

  /**
   * Retrieves the current Bitcoin network configuration.
   *
   * @returns The `Network` instance representing the current Bitcoin network (e.g., mainnet, testnet).
   */
  getNetwork(): Network {
    return this.network;
  }

  /**
   * Retrieves the current connection parameters used to connect to the Electrum node.
   *
   * @returns An object containing the host, port, SSL usage, and network type of the Electrum connection.
   *
   * @throws {Error} Throws an error if connection parameters are not set.
   */
  getConnectionParams(): {
    host: string;
    port: number;
    ssl: boolean;
    network: 'mainnet' | 'testnet';
  } {
    if (
      this.electrumHost &&
      this.electrumPort !== undefined &&
      this.electrumSsl !== undefined &&
      this.electrumNetwork !== undefined
    ) {
      return {
        host: this.electrumHost,
        port: this.electrumPort,
        ssl: this.electrumSsl,
        network: this.electrumNetwork,
      };
    } else {
      throw new Error('Electrum connection parameters are not set.');
    }
  }
}
