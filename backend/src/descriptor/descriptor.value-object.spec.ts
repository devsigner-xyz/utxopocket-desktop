import { Descriptor } from './descriptor.value-object';
import { UnsupportedDescriptorException } from './exception/unsupported-descriptor.exception';

describe('Descriptor', () => {
  it('should throw InvalidDescriptorException when descriptor is invalid', () => {
    expect(() => Descriptor.create('test')).toThrow(
      UnsupportedDescriptorException,
    );
  });

  it('should throw UnsupportedDescriptorException when descriptor is unsupported', () => {
    expect(() => Descriptor.create('and_v(v:pk(1),after(10))')).toThrow(
      UnsupportedDescriptorException,
    );
  });

  it('should create a valid descriptor', () => {
    const validDescriptor = 'pk(A)';
    const descriptor = Descriptor.create(validDescriptor);
    expect(descriptor.value).toEqual(validDescriptor);
    expect(descriptor.type).toEqual('pk()');
    expect(descriptor.name).toEqual('Pay-to-PubKey (P2PK)');
  });

  it('should derive a valid descriptor', () => {
    const validDescriptor = 'pk(A)';
    const descriptor = Descriptor.create(validDescriptor);
    expect(descriptor.deriveDescriptors()).toEqual({
      externalDescriptor: 'pk(A/0/*)',
      internalDescriptor: 'pk(A/1/*)',
    });
  });
});
