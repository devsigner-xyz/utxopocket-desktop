export class InvalidDescriptorException extends Error {
  constructor(descriptor: string) {
    super(`Invalid descriptor format for ${descriptor}`);
  }
}
