import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BlockService } from './block.service';
import { ApiExcludeController } from '@nestjs/swagger';

/**
 * Controller responsible for handling block-related HTTP requests and Server-Sent Events (SSE).
 */
@ApiExcludeController()
@Controller('block')
export class BlockController {
  /**
   * Creates an instance of BlockController.
   *
   * @param blockService Service responsible for block operations.
   */
  constructor(private readonly blockService: BlockService) {}

  /**
   * Establishes a Server-Sent Events (SSE) stream to provide real-time updates on new blocks.
   *
   * This endpoint allows clients to subscribe to block updates. It leverages the
   * BlockService to poll for new blocks and emits the block status to subscribed clients.
   *
   * @returns An Observable that emits block status updates as they occur.
   *
   * @throws {Error} Throws an error if the block polling operation fails.
   */
  @Sse('block-updates')
  blockUpdates(): Observable<{ data: any }> {
    return new Observable((subscriber) => {
      // Subscribe to the block polling Observable from BlockService
      const blockSubscription = this.blockService.pollBlocks().subscribe({
        next: (blockStatus) => {
          subscriber.next({ data: blockStatus });
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      // Cleanup function to unsubscribe from the block polling Observable
      return () => {
        blockSubscription.unsubscribe();
      };
    });
  }
}
