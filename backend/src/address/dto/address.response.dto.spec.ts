import { AddressesResponseDto } from './address.response.dto';

describe('AddressesResponseDto', () => {
  it('should initialize with external and internal addresses', () => {
    const externalAddresses = ['externalAddress1', 'externalAddress2'];
    const internalAddresses = ['internalAddress1', 'internalAddress2'];

    const response = new AddressesResponseDto();
    response.externalAddresses = externalAddresses;
    response.internalAddresses = internalAddresses;

    expect(response.externalAddresses).toEqual(externalAddresses);
    expect(response.internalAddresses).toEqual(internalAddresses);
  });

  it('should handle empty addresses gracefully', () => {
    const response = new AddressesResponseDto();
    response.externalAddresses = [];
    response.internalAddresses = [];

    expect(response.externalAddresses).toEqual([]);
    expect(response.internalAddresses).toEqual([]);
  });
});
