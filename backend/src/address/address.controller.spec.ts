import { MockProxy, mock } from 'jest-mock-extended';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

describe('AddressController', () => {
  let addressController: AddressController;
  let addressService: MockProxy<AddressService>;

  beforeEach(() => {
    addressService = mock<AddressService>();

    addressController = new AddressController(addressService);
  });

  describe('getAddresses', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'invalid',
      };

      addressService.getAddresses.mockRejectedValue(new Error('test'));

      await expect(
        addressController.getAddresses(descriptorRequestDto),
      ).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should return addresses successfully', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'pk(A)',
      };

      const externalAddresses = ['address1'];
      const internalAddresses = ['address2'];

      addressService.getAddresses.mockResolvedValue({
        externalAddresses,
        internalAddresses,
      });

      const response =
        await addressController.getAddresses(descriptorRequestDto);
      expect(response).toEqual({
        externalAddresses,
        internalAddresses,
      });
      expect(addressService.getAddresses).toHaveBeenCalledWith(
        descriptorRequestDto.descriptor,
      );
    });
  });
});
