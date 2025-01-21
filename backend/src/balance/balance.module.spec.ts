import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BalanceModule } from './balance.module';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

describe('BalanceModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        BalanceModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(BalanceController)).toBeInstanceOf(BalanceController);
    expect(module.get(BalanceService)).toBeInstanceOf(BalanceService);
  });
});
