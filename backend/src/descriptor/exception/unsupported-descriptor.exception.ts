export class UnsupportedDescriptorException extends Error {
  constructor(descriptor: string) {
    super(`Unsupported descriptor type for ${descriptor}`);
  }
}
