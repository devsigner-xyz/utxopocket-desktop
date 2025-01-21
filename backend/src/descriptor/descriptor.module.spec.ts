import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DescriptorModule } from './descriptor.module';
import { DescriptorController } from './descriptor.controller';
import { DescriptorService } from './descriptor.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('DescriptorModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        DescriptorModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(DescriptorController)).toBeInstanceOf(
      DescriptorController,
    );
    expect(module.get(DescriptorService)).toBeInstanceOf(DescriptorService);
  });
});
