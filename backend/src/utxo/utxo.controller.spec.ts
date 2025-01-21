import { MockProxy, mock } from 'jest-mock-extended';
import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { UtxoBuilder } from '../../test/builder/utxo.builder';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UtxoController } from './utxo.controller';
import { UtxoService } from './utxo.service';

describe('UtxoController', () => {
  let utxoController: UtxoController;
  let utxoService: MockProxy<UtxoService>;

  beforeEach(() => {
    utxoService = mock<UtxoService>();

    utxoController = new UtxoController(utxoService);
  });

  describe('getUtxos', () => {
    it('should throw an InternalServerErrorException when service throws an error', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'invalid',
      };

      utxoService.getUtxos.mockRejectedValue(new Error('test'));

      await expect(
        utxoController.getUtxos(descriptorRequestDto),
      ).rejects.toThrow(
        new HttpException('test', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should return utxos successfully', async () => {
      const descriptorRequestDto: DescriptorRequestDto = {
        descriptor: 'pk(A)',
      };

      const utxos = [UtxoBuilder.create('utxo1').build()];

      utxoService.getUtxos.mockResolvedValue({
        utxos,
      });

      const response = await utxoController.getUtxos(descriptorRequestDto);
      expect(response).toEqual({
        utxos,
      });
      expect(utxoService.getUtxos).toHaveBeenCalledWith(
        descriptorRequestDto.descriptor,
      );
    });
  });
});
