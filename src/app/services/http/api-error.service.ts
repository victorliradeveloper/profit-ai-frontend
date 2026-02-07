import { Injectable } from '@angular/core';

export type ApiErrorMessageOverrides = {
  badRequest?: string;
  unauthorized?: string;
  forbidden?: string;
  notFound?: string;
  conflict?: string;
  serverError?: string;
  networkError?: string;
  fallback?: string;
};

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {
  isUnauthorized(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  getServerMessage(error: any): string | null {
    const err = error?.error;
    if (!err) return null;

    if (typeof err === 'string') {
      const trimmed = err.trim();
      return trimmed ? trimmed : null;
    }

    const msg = err?.message || err?.error;
    return typeof msg === 'string' && msg.trim() ? msg.trim() : null;
  }

  message(error: any, overrides: ApiErrorMessageOverrides = {}): string {
    const status = error?.status;
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

