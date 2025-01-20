import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from './address.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('AddressModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        AddressModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(AddressController)).toBeInstanceOf(AddressController);
    expect(module.get(AddressService)).toBeInstanceOf(AddressService);
  });
});
