import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogService } from '@common/log/log.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logger: LogService) {}

  @Sse('stream')
  logStream(): Observable<{ data: string }> {
    return this.logger
      .getLogStream()
      .pipe(map((logMessage: string) => ({ data: logMessage })));
  }
}
