import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as secp256k1 from '@bitcoinerlab/secp256k1';
import { DescriptorsFactory } from '@bitcoinerlab/descriptors';
import { NodeService } from '@node/node.service';
import { DescriptorService } from '@descriptor/descriptor.service';
import { DiscoveryService } from '@discovery/discovery.service';
import { Descriptor } from '@descriptor/descriptor.value-object';

const { Output } = DescriptorsFactory(secp256k1);

/**
 * Service responsible for managing wallet address operations.
 */
@Injectable()
export class AddressService {
  /**
   * Creates an instance of AddressService.
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
   * Retrieves the external and internal addresses associated with a wallet descriptor.
   *
   * This method ensures a connection to the Electrum node, validates the provided
   * descriptor, derives the necessary descriptors for external and internal addresses,
   * and then retrieves the corresponding addresses using the DiscoveryService.
   *
   * **Supported Descriptor Types:** `pk`, `pkh`, `wpkh`, `sh(wpkh)`.
   *
   * @param baseDescriptor - The wallet descriptor used to generate or retrieve the addresses.
   * @returns An object containing arrays of external and internal addresses.
   *
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if the address retrieval operation fails.
   */
  async getAddresses(
    baseDescriptor: string,
  ): Promise<{ externalAddresses: string[]; internalAddresses: string[] }> {
    // Ensure a connection to the Electrum node is established
    await this.nodeService.ensureElectrumConnection();
    const network = this.nodeService.getNetwork();

    const descriptor = Descriptor.create(baseDescriptor);
    try {
      // Obtain the discovery instance for the provided descriptor
      const discovery =
        await this.discoveryService.getDiscoveryInstance(descriptor);

      // Derive external and internal descriptors from the base descriptor
      const { externalDescriptor, internalDescriptor } =
        descriptor.deriveDescriptors();

      // Determine the next index for external descriptors
      const externalNextIndex = discovery.getNextIndex({
        descriptor: externalDescriptor,
      });
      const externalHighestIndex = externalNextIndex - 1;

      const externalAddresses: string[] = [];
      // Generate external addresses up to the highest index
      for (let index = 0; index <= externalHighestIndex; index++) {
        const output = new Output({
          descriptor: externalDescriptor,
          network,
          index,
        });
        externalAddresses.push(output.getAddress());
      }

      let internalAddresses: string[] = [];
      try {
        // Determine the next index for internal descriptors
        const internalNextIndex = discovery.getNextIndex({
          descriptor: internalDescriptor,
        });
        const internalHighestIndex = internalNextIndex - 1;

        // Generate internal addresses up to the highest index
        for (let index = 0; index <= internalHighestIndex; index++) {
          const output = new Output({
            descriptor: internalDescriptor,
            network,
            index,
          });
          internalAddresses.push(output.getAddress());
        }
      } catch {
        // Log a warning if no internal addresses are found
        console.warn(
          `No internal addresses found for descriptor: ${internalDescriptor}`,
        );
        internalAddresses = [];
      }

      return { externalAddresses, internalAddresses };
    } catch (error) {
      // Throw an HTTP exception if an error occurs during address retrieval
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Derives a list of addresses from a given descriptor.
   *
   * This method generates a specified number of addresses based on the provided descriptor
   * and gap limit. It utilizes the `Output` class to create address instances for each index.
   *
   * @param descriptor - The descriptor from which to derive addresses.
   * @param gapLimit - The maximum number of addresses to derive. Defaults to 50.
   * @returns An array of derived addresses.
   */
  getDerivedAddresses(descriptor: string, gapLimit: number = 50): string[] {
    const addresses: string[] = [];
    const network = this.nodeService.getNetwork();
    for (let index = 0; index < gapLimit; index++) {
      const output = new Output({
        descriptor,
        network,
        index,
      });
      addresses.push(output.getAddress());
    }
    return addresses;
  }
}
