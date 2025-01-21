import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ElectrumModule } from './electrum.module';
import { ElectrumService } from './electrum.service';

describe('ElectrumModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), ElectrumModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ElectrumService)).toBeInstanceOf(ElectrumService);
  });
});
