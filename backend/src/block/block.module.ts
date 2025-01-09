import { Module } from '@nestjs/common';
import { BlockService } from '@block/block.service';
import { NodeModule } from '@node/node.module';
import { BlockController } from './block.controller';

@Module({
  imports: [NodeModule],
  providers: [BlockService],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
