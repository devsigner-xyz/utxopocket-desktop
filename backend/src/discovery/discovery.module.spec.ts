import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from './discovery.module';
import { DiscoveryService } from './discovery.service';

describe('DiscoveryModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DiscoveryModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(DiscoveryService)).toBeInstanceOf(DiscoveryService);
  });
});
