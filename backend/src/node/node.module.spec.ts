import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { NodeModule } from './node.module';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';

describe('NodeModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), NodeModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(NodeController)).toBeInstanceOf(NodeController);
    expect(module.get(NodeService)).toBeInstanceOf(NodeService);
  });
});
