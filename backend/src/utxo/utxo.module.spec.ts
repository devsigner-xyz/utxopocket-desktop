import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { UtxoModule } from './utxo.module';
import { UtxoController } from './utxo.controller';
import { UtxoService } from './utxo.service';

describe('UtxoModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
        }),
        UtxoModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(UtxoController)).toBeInstanceOf(UtxoController);
    expect(module.get(UtxoService)).toBeInstanceOf(UtxoService);
  });
});
