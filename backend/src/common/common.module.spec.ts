import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common.module';
import { LogService } from './log/log.service';

describe('CommonModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(LogService)).toBeInstanceOf(LogService);
  });
});
