import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { BlockController } from './block.controller';
import { BlockModule } from './block.module';
import { BlockService } from './block.service';

describe('BlockModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), BlockModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(BlockController)).toBeInstanceOf(BlockController);
    expect(module.get(BlockService)).toBeInstanceOf(BlockService);
  });
});
