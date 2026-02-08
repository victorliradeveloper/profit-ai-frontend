import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    if (environment.production) return;
    console.debug(message, ...optionalParams);
  }

  info(message?: unknown, ...optionalParams: unknown[]): void {
    if (environment.production) return;
    console.info(message, ...optionalParams);
  }

  warn(message?: unknown, ...optionalParams: unknown[]): void {
    if (environment.production) return;
    console.warn(message, ...optionalParams);
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
    if (environment.production) return;
    console.error(message, ...optionalParams);
  }
}

