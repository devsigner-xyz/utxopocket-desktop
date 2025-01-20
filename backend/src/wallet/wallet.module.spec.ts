import { Test } from '@nestjs/testing';
import { WalletModule } from './wallet.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

describe('WalletModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        WalletModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(WalletController)).toBeInstanceOf(WalletController);
    expect(module.get(WalletService)).toBeInstanceOf(WalletService);
  });
});
