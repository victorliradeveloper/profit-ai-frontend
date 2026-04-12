import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/logger/logger.service';
import { API_PATHS } from '../services/http/api-paths';

const LOGIN_ROUTE = '/login' as const;
const AUTH_INTERCEPTOR_LOG = 'AuthInterceptor';

const SESSION_INVALID_STATUSES = [401, 403] as const;
type SessionInvalidStatus = (typeof SESSION_INVALID_STATUSES)[number];

interface AuthInterceptorContext {
  authService: AuthService;
  router: Router;
  logger: LoggerService;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const context = createInterceptorContext();
  const { authService, logger } = context;

  const token = authService.getToken();
  const requestToSend = createAuthenticatedRequest(req, token);
  const interceptorAddedBearer = shouldAttachBearerToken(req, token);

  logger.debug(AUTH_INTERCEPTOR_LOG, {
    url: req.url,
    hasToken: !!token,
    interceptorAddedBearer,
  });

  return next(requestToSend).pipe(
    catchError((error) =>
      handleAuthError(error, context, interceptorAddedBearer, requestToSend)
    )
  );
};

function createInterceptorContext(): AuthInterceptorContext {
  return {
    authService: inject(AuthService),
    router: inject(Router),
    logger: inject(LoggerService),
  };
}

function shouldAttachBearerToken(
  req: HttpRequest<unknown>,
  token: string | null
): boolean {
  return !!token && !req.headers.has('Authorization');
}

function createAuthenticatedRequest(
  req: HttpRequest<unknown>,
  token: string | null
): HttpRequest<unknown> {
  if (!shouldAttachBearerToken(req, token)) {
    return req;
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleAuthError(
  error: unknown,
  { authService, router, logger }: AuthInterceptorContext,
  interceptorAddedBearer: boolean,
  request: HttpRequest<unknown>
): Observable<never> {
  const status = extractHttpStatus(error);

  logger.warn(`${AUTH_INTERCEPTOR_LOG} error`, {
    status,
    url: request.url,
    interceptorAddedBearer,
  });

  if (shouldLogout(interceptorAddedBearer, status, request.url)) {
    logger.info('Session invalid - logging out and redirecting to login');
    authService.logout();
    void router.navigate([LOGIN_ROUTE]);
  }

  return throwError(() => error);
}

function extractHttpStatus(error: unknown): number | undefined {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }

  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function shouldLogout(
  interceptorAddedBearer: boolean,
  status: number | undefined,
  url: string
): boolean {
  return (
    interceptorAddedBearer &&
    isSessionInvalidStatus(status) &&
    !isAuthExcludedEndpoint(url)
  );
}

function isSessionInvalidStatus(
  status: number | undefined
): status is SessionInvalidStatus {
  return SESSION_INVALID_STATUSES.includes(status as SessionInvalidStatus);
}

function isAuthExcludedEndpoint(url: string): boolean {
  return (
    url.includes(API_PATHS.auth.login) ||
    url.includes(API_PATHS.auth.register)
  );
}
