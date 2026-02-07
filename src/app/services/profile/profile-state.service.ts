import { Injectable } from '@angular/core';

@Injectable()
export class ProfileStateService {
  successMessage: string = '';
  errorMessage: string = '';

  private messageTimeout?: ReturnType<typeof setTimeout>;

  clear(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.clearTimeout();
  }

  setSuccess(message: string, durationMs: number = 3000): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.clearTimeout();
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
    }, durationMs);
  }

  setError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.clearTimeout();
  }

  destroy(): void {
    this.clearTimeout();
  }

  private clearTimeout(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = undefined;
    }
  }
}

