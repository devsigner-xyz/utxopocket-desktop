import { Injectable, Inject, Logger } from '@nestjs/common';
import { compileMiniscript } from '@bitcoinerlab/miniscript';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Network } from 'bitcoinjs-lib';
import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { UtilsService } from '@common/utils/utils.service';
import { DescriptorType } from './enum/descryptor-type.enum';
import { Descriptor } from './descriptor.value-object';

/**
 * Service responsible for managing wallet descriptors.
 */
@Injectable()
export class DescriptorService {
  private readonly logger = new Logger(DescriptorService.name);

  /**
   * Creates an instance of DescriptorService.
   *
   * @param cacheManager Cache manager for storing and retrieving cached data.
   * @param nodeService Service responsible for managing node connections.
   * @param discoveryService Service responsible for discovering wallet information.
   */
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly nodeService: NodeService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  /**
   * Loads a wallet based on the provided descriptor and gap limit.
   *
   * This method ensures a connection to the Electrum node, validates the descriptor,
   * creates a discovery instance for the wallet, and caches the descriptor for future use.
   *
   * @param descriptor - The wallet descriptor used to generate or retrieve the wallet.
   * @param gapLimit - The maximum number of consecutive unused addresses to scan. Defaults to 100.
   * @returns An object containing a success message upon successful wallet loading.
   *
   * @throws {Error} Throws an error if the descriptor validation fails or if there are issues loading the wallet.
   */
  async loadWallet(
    baseDescriptor: string,
    gapLimit: number = 100,
  ): Promise<{ message: string }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();

    const descriptor = Descriptor.create(baseDescriptor);

    // Create a discovery instance for the wallet
    const result = await this.discoveryService.createDiscoveryInstance(
      descriptor,
      gapLimit,
    );

    // Cache the wallet descriptor for future reference
    await this.cacheManager.set('walletDescriptor', descriptor.value);
    return result;
  }

  /**
   * Retrieves the stored wallet descriptor from the cache.
   *
   * @returns The stored wallet descriptor as a string or `null` if not found.
   */
  async getStoredDescriptor(): Promise<Descriptor | null> {
    const baseDescriptor =
      await this.cacheManager.get<string>('walletDescriptor');

    if (!baseDescriptor) {
      return null;
    }

    return Descriptor.create(baseDescriptor);
  }

  /**
   * Retrieves the current network configuration.
   *
   * @returns The Bitcoin network configuration (e.g., mainnet, testnet).
   */
  getNetwork(): Network {
    return this.nodeService.getNetwork();
  }
}
