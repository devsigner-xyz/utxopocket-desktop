import { Injectable, Inject, Logger } from '@nestjs/common';
import { compileMiniscript } from '@bitcoinerlab/miniscript';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Network } from 'bitcoinjs-lib';
import { NodeService } from '@node/node.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { UtilsService } from '@common/utils/utils.service';

/**
 * Service responsible for managing wallet descriptors.
 */
@Injectable()
export class DescriptorService {
  private readonly logger = new Logger(DescriptorService.name);

  /**
   * Defines valid descriptor patterns and their corresponding types.
   */
  private readonly validPatterns = [
    { regex: /^pk\(/, type: 'Pay-to-PubKey (P2PK)' },
    { regex: /^pkh\(/, type: 'Pay-to-PubKey-Hash (P2PKH)' },
    { regex: /^wpkh\(/, type: 'Pay-to-Witness-PubKey-Hash (P2WPKH)' },
    {
      regex: /^sh\(wpkh\(/,
      type: 'Pay-to-Script-Hash SegWit (P2SH-P2WPKH)',
    },
  ];

  /**
   * Creates an instance of DescriptorService.
   *
   * @param cacheManager Cache manager for storing and retrieving cached data.
   * @param nodeService Service responsible for managing node connections.
   * @param discoveryService Service responsible for discovering wallet information.
   * @param utils Utility service for common operations.
   */
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly nodeService: NodeService,
    private readonly discoveryService: DiscoveryService,
    private readonly utils: UtilsService,
  ) {}

  /**
   * Validates a given wallet descriptor.
   *
   * This method compiles the descriptor using Miniscript to ensure its validity and checks
   * if the descriptor matches one of the supported patterns.
   *
   * **Supported Descriptor Types:** `pk()`, `pkh()`, `wpkh()`, `sh(wpkh())`.
   *
   * @param descriptor - The wallet descriptor to validate.
   * @returns An object indicating whether the descriptor is valid and an error message if invalid.
   *
   * @throws {Error} Throws an error if the descriptor format is invalid or unsupported.
   */
  async validateDescriptor(
    descriptor: string,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Compile the descriptor to ensure it's syntactically correct
      compileMiniscript(descriptor);

      // Check if the descriptor matches any of the supported patterns
      const isValid = this.validPatterns.some((pattern) =>
        pattern.regex.test(descriptor),
      );
      if (!isValid) {
        return { isValid: false, error: 'Unsupported descriptor type.' };
      }

      return { isValid: true };
    } catch (err) {
      return { isValid: false, error: 'Invalid descriptor format.' };
    }
  }

  /**
   * Determines the type of a given wallet descriptor.
   *
   * @param descriptor - The wallet descriptor whose type is to be determined.
   * @returns A string representing the type of the descriptor or a message if unsupported.
   */
  getDescriptorType(descriptor: string): string {
    const found = this.validPatterns.find((pattern) =>
      pattern.regex.test(descriptor),
    );
    return found ? found.type : 'Unsupported descriptor type';
  }

  /**
   * Loads a wallet based on the provided descriptor and gap limit.
   *
   * This method ensures a connection to the Electrum node, validates the descriptor,
   * creates a discovery instance for the wallet, and caches the descriptor for future use.
   *
   * @param baseDescriptor - The wallet descriptor used to generate or retrieve the wallet.
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

    // Validate the provided descriptor
    const validation = await this.validateDescriptor(baseDescriptor);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create a discovery instance for the wallet
    const result = await this.discoveryService.createDiscoveryInstance(
      baseDescriptor,
      gapLimit,
    );

    // Cache the wallet descriptor for future reference
    await this.cacheManager.set('walletDescriptor', baseDescriptor);
    return result;
  }

  /**
   * Derives external and internal descriptors from a base descriptor.
   *
   * This method appends derivation paths to the base descriptor to generate
   * descriptors for external (receiving) and internal (change) addresses.
   *
   * @param baseDescriptor - The base wallet descriptor from which to derive additional descriptors.
   * @returns An object containing the external and internal descriptors.
   */
  deriveDescriptors(baseDescriptor: string): {
    externalDescriptor: string;
    internalDescriptor: string;
  } {
    return {
      externalDescriptor: this.utils.insertDerivationPath(
        baseDescriptor,
        '/0/*',
      ),
      internalDescriptor: this.utils.insertDerivationPath(
        baseDescriptor,
        '/1/*',
      ),
    };
  }

  /**
   * Retrieves the stored wallet descriptor from the cache.
   *
   * @returns The stored wallet descriptor as a string or `null` if not found.
   */
  async getStoredDescriptor(): Promise<string | null> {
    return (await this.cacheManager.get<string>('walletDescriptor')) || null;
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
