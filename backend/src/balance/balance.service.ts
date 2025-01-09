import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NodeService } from '@node/node.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryService } from '@discovery/discovery.service';

/**
 * Service responsible for managing wallet balance operations.
 */
@Injectable()
export class BalanceService {
  /**
   * Creates an instance of BalanceService.
   *
   * @param nodeService Service responsible for managing node connections.
   * @param descriptorService Service responsible for validating and deriving descriptors.
   * @param discoveryService Service responsible for discovering wallet information.
   */
  constructor(
    private readonly nodeService: NodeService,
    private readonly descriptorService: DescriptorService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  /**
   * Retrieves the total balance for a given wallet descriptor.
   *
   * This method ensures a connection to the Electrum node, validates the provided
   * descriptor, derives the necessary descriptors for external and internal addresses,
   * and then calculates the total balance using the DiscoveryService.
   *
   * **Supported Descriptor Types:** `pk`, `pkh`, `wpkh`, `sh(wpkh)`.
   *
   * @param baseDescriptor - The wallet descriptor used to generate or retrieve the balance.
   * @returns An object containing the total wallet balance.
   *
   * @throws {HttpException} Throws a BAD_REQUEST error if the descriptor validation fails.
   * @throws {Error} Throws an error if the balance retrieval operation encounters an issue.
   */
  async getBalance(baseDescriptor: string): Promise<{ balance: number }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();

    // Validate the provided descriptor
    const { isValid, error } =
      await this.descriptorService.validateDescriptor(baseDescriptor);
    if (!isValid) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }

    // Obtain the discovery instance for the provided descriptor
    const discovery =
      await this.discoveryService.getDiscoveryInstance(baseDescriptor);

    // Derive external and internal descriptors from the base descriptor
    const { externalDescriptor, internalDescriptor } =
      this.descriptorService.deriveDescriptors(baseDescriptor);

    // Calculate the total balance using the derived descriptors
    const balance = discovery.getBalance({
      descriptors: [externalDescriptor, internalDescriptor],
    });

    return { balance };
  }
}
