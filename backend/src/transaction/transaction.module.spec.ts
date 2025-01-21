import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './transaction.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('TransactionModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        TransactionModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(TransactionController)).toBeInstanceOf(
      TransactionController,
    );
    expect(module.get(TransactionService)).toBeInstanceOf(TransactionService);
  });
});
