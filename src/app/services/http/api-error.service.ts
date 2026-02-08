import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorMessageOverrides } from './api-error.types';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {
  private isHttpLikeError(error: unknown): error is { status?: unknown; error?: unknown } {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  isUnauthorized(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) return error.status === 401 || error.status === 403;
    if (!this.isHttpLikeError(error)) return false;
    const status = (error as { status?: unknown }).status;
    return status === 401 || status === 403;
  }

  getServerMessage(error: unknown): string | null {
    const errBody =
      error instanceof HttpErrorResponse
        ? error.error
        : this.isHttpLikeError(error)
          ? (error as { error?: unknown }).error
          : null;

    if (!errBody) return null;

    if (typeof errBody === 'string') {
      const trimmed = errBody.trim();
      return trimmed ? trimmed : null;
    }

    const msg =
      typeof errBody === 'object' && errBody !== null
        ? ((errBody as { message?: unknown; error?: unknown }).message ??
            (errBody as { message?: unknown; error?: unknown }).error)
        : null;
    return typeof msg === 'string' && msg.trim() ? msg.trim() : null;
  }

  message(error: unknown, overrides: ApiErrorMessageOverrides = {}): string {
    const status =
      error instanceof HttpErrorResponse
        ? error.status
        : this.isHttpLikeError(error)
          ? ((error as { status?: unknown }).status as number | undefined)
          : undefined;
    const serverMessage = this.getServerMessage(error);

    if (status === 0) {
      return overrides.networkError || 'Não foi possível conectar ao servidor. Tente novamente.';
    }

    if (status === 400) {
      return serverMessage || overrides.badRequest || 'Dados inválidos. Verifique as informações.';
    }

    if (status === 401) {
      return overrides.unauthorized || 'Não autorizado.';
    }

    if (status === 403) {
      return overrides.forbidden || overrides.unauthorized || 'Acesso negado.';
    }

    if (status === 404) {
      return overrides.notFound || 'Recurso não encontrado.';
    }

    if (status === 409) {
      return serverMessage || overrides.conflict || 'Conflito ao processar solicitação.';
    }

    if (typeof status === 'number' && status >= 500) {
      return overrides.serverError || 'Erro no servidor. Tente novamente mais tarde.';
    }

    return serverMessage || overrides.fallback || 'Ocorreu um erro. Tente novamente.';
  }
}

