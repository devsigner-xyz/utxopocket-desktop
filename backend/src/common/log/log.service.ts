import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class LogService implements NestLoggerService {
  private logSubject = new Subject<string>();

  log(message: any, context?: string) {
    const logMessage = `[LOG]${context ? '[' + context + ']' : ''} ${message}`;
    console.log(logMessage);
    this.logSubject.next(logMessage);
  }

  error(message: any, trace?: string, context?: string) {
    const logMessage = `[ERROR]${context ? '[' + context + ']' : ''} ${message} ${trace ? trace : ''}`;
    console.error(logMessage);
    this.logSubject.next(logMessage);
  }

  warn(message: any, context?: string) {
    const logMessage = `[WARN]${context ? '[' + context + ']' : ''} ${message}`;
    console.warn(logMessage);
    this.logSubject.next(logMessage);
  }

  debug(message: any, context?: string) {
    const logMessage = `[DEBUG]${context ? '[' + context + ']' : ''} ${message}`;
    console.debug(logMessage);
    this.logSubject.next(logMessage);
  }

  verbose(message: any, context?: string) {
    const logMessage = `[VERBOSE]${context ? '[' + context + ']' : ''} ${message}`;
    console.log(logMessage);
    this.logSubject.next(logMessage);
  }

  /**
   * Retorna el Subject al que se suscribirá el controller SSE para emitir logs.
   */
  getLogStream() {
    return this.logSubject.asObservable();
  }
}
