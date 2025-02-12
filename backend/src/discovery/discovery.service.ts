import { Injectable } from '@nestjs/common';
import { DiscoveryFactory, DiscoveryInstance } from '@bitcoinerlab/discovery';
import { NodeService } from '@node/node.service';
import { Descriptor } from '@descriptor/descriptor.value-object';

/**
 * Service responsible for managing wallet discovery instances.
 *
 * This service handles the creation, retrieval, and management of discovery instances
 * associated with specific wallet descriptors. It interacts with the Electrum node to
 * ensure connectivity and utilizes utility services for descriptor manipulation.
 */
@Injectable()
export class DiscoveryService {
  /**
   * A map storing discovery instances keyed by their respective wallet descriptors.
   */
  protected discoveryInstances: Map<string, DiscoveryInstance> = new Map();

  /**
   * Creates an instance of DiscoveryService.
   *
   * @param nodeService Service responsible for managing node connections and interactions.
   */
  constructor(private readonly nodeService: NodeService) {}

  /**
   * Retrieves an existing discovery instance for a given wallet descriptor.
   *
   * This method checks if a discovery instance associated with the provided descriptor
   * already exists. If found, it returns the instance; otherwise, it throws an error.
   *
   * @param descriptor - The wallet descriptor for which to retrieve the discovery instance.
   * @returns The `DiscoveryInstance` associated with the provided descriptor.
   *
   * @throws {Error} Throws an error if no discovery instance is found for the descriptor.
   */
  async getDiscoveryInstance(
    descriptor: Descriptor,
  ): Promise<DiscoveryInstance> {
    if (this.discoveryInstances.has(descriptor.value)) {
      return this.discoveryInstances.get(descriptor.value)!;
    } else {
      throw new Error(
        `Discovery instance not found for descriptor: ${descriptor.value}`,
      );
    }
  }

  /**
   * Creates and stores a new discovery instance for a given wallet descriptor.
   *
   * This method ensures a connection to the Electrum node, checks if a discovery instance
   * for the descriptor already exists, and if not, creates a new discovery instance using
   * the provided descriptor and gap limit. The newly created discovery instance is then
   * stored for future retrieval.
   *
   * @param descriptor - The wallet descriptor for which to create the discovery instance.
   * @param gapLimit - The gap limit determining how many consecutive unused addresses to scan.
   *                   Defaults to 100 if not provided.
   * @returns An object containing a confirmation message upon successful creation.
   *
   * @throws {Error} Throws an error if there is an issue ensuring Electrum connection or
   *                 during the creation of the discovery instance.
   */
  async createDiscoveryInstance(
    descriptor: Descriptor,
    gapLimit: number = 100,
  ): Promise<{ message: string }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();
    const electrumExplorer = this.nodeService.getElectrumExplorer();
    const network = this.nodeService.getNetwork();

    // Check if a discovery instance for the descriptor already exists
    if (this.discoveryInstances.has(descriptor.value)) {
      return { message: 'Descriptor already loaded.' };
    }

    // Create a new discovery instance using the DiscoveryFactory
    const { Discovery } = DiscoveryFactory(electrumExplorer, network);
    const discoveryInstance = new Discovery();

    this.discoveryInstances.set(descriptor.value, discoveryInstance);
    const { externalDescriptor, internalDescriptor } =
      descriptor.deriveDescriptors();

    // Fetch the discovery data using the derived descriptors and gap limit
    await discoveryInstance.fetch({
      descriptors: [externalDescriptor, internalDescriptor],
      gapLimit,
    });

    return { message: 'Descriptor loaded successfully.' };
  }

  /**
   * Deletes a discovery instance associated with a given wallet descriptor.
   *
   * This method removes the discovery instance from the internal storage, effectively
   * stopping any ongoing discovery processes related to the descriptor.
   *
   * @param descriptor - The wallet descriptor whose discovery instance is to be removed.
   */
  removeDiscoveryInstance(descriptor: string): void {
    this.discoveryInstances.delete(descriptor);
  }

  /**
   * Clears all discovery instances managed by the service.
   *
   * This method removes all stored discovery instances, effectively resetting the
   * discovery state for all wallet descriptors.
   */
  clearDiscoveryInstances(): void {
    this.discoveryInstances.clear();
  }
}
