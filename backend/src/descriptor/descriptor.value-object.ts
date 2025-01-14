import { compileMiniscript } from '@bitcoinerlab/miniscript';
import { DescriptorType } from './enum/descryptor-type.enum';
import { UnsupportedDescriptorException } from './exception/unsupported-descriptor.exception';
import { InvalidDescriptorException } from './exception/invalid-descriptor.exception';
import { UtilsService } from '@common/utils/utils.service';

export class Descriptor {
  /**
   * Defines valid descriptor patterns and their corresponding types.
   */
  private readonly validPatterns = [
    { regex: /^pk\(/, type: DescriptorType.PK, name: 'Pay-to-PubKey (P2PK)' },
    {
      regex: /^pkh\(/,
      type: DescriptorType.PKH,
      name: 'Pay-to-PubKey-Hash (P2PKH)',
    },
    {
      regex: /^wpkh\(/,
      type: DescriptorType.WPKH,
      name: 'Pay-to-Witness-PubKey-Hash (P2WPKH)',
    },
    {
      regex: /^sh\(wpkh\(/,
      type: DescriptorType.SH_WPKH,
      name: 'Pay-to-Script-Hash SegWit (P2SH-P2WPKH)',
    },
  ];

  private constructor(readonly value: string) {
    try {
      // Compile the descriptor to ensure it's syntactically correct
      compileMiniscript(value);

      // Check if the descriptor matches any of the supported patterns
      const isValid = this.validPatterns.some((pattern) =>
        pattern.regex.test(value),
      );
      if (!isValid) {
        throw new UnsupportedDescriptorException(value);
      }
    } catch (err) {
      throw new InvalidDescriptorException(value);
    }
  }

  get type(): string {
    const found = this.validPatterns.find((pattern) =>
      pattern.regex.test(this.value),
    );
    return found.name;
  }

  static create(descriptor: string): Descriptor {
    return new Descriptor(descriptor);
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
  deriveDescriptors(): {
    externalDescriptor: string;
    internalDescriptor: string;
  } {
    return {
      externalDescriptor: UtilsService.insertDerivationPath(this.value, '/0/*'),
      internalDescriptor: UtilsService.insertDerivationPath(this.value, '/1/*'),
    };
  }
}
