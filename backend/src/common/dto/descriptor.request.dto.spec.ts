import { DescriptorRequestDto } from '@common/dto/descriptor.request.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('DescriptorRequestDto', () => {
  it('should throw error if descriptor is not provided', async () => {
    const descriptorRequestDto: DescriptorRequestDto = { descriptor: '' };
    const descriptorRequestDtoInstance = plainToInstance(
      DescriptorRequestDto,
      descriptorRequestDto,
    );
    const errors = await validate(descriptorRequestDtoInstance);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints.isNotEmpty).toBeDefined();
  });

  it('should throw error if descriptor contains blank spaces', async () => {
    const descriptorRequestDto: DescriptorRequestDto = { descriptor: ' ' };
    const descriptorRequestDtoInstance = plainToInstance(
      DescriptorRequestDto,
      descriptorRequestDto,
    );
    const errors = await validate(descriptorRequestDtoInstance);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints.notContains).toBeDefined();
  });

  it('should not throw error if descriptor is valid', async () => {
    const descriptorRequestDto: DescriptorRequestDto = { descriptor: 'pk(A)' };
    const descriptorRequestDtoInstance = plainToInstance(
      DescriptorRequestDto,
      descriptorRequestDto,
    );
    const errors = await validate(descriptorRequestDtoInstance);
    expect(errors).toHaveLength(0);
  });
});
