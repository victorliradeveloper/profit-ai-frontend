import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_PATHS } from '../services/http/api-paths';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const isAuthenticatedRequest = !!token && !req.headers.has('Authorization');
  const requestToSend = isAuthenticatedRequest
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(requestToSend).pipe(
    catchError((error: unknown) => {
      const status = getHttpStatus(error);

      // When the token is expired/invalid, don't keep the app in a "half-authenticated" state.
      // Only do this if THIS request was authenticated by us (Bearer token attached).
      if (
        isAuthenticatedRequest &&
        isSessionInvalidStatus(status) &&
        !isAuthExcludedEndpoint(requestToSend.url)
      ) {
        authService.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};

function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof HttpErrorResponse) return error.status;
  if (typeof error !== 'object' || error === null) return undefined;
  if (!('status' in error)) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function isSessionInvalidStatus(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

function isAuthExcludedEndpoint(url: string): boolean {
  // Avoid logging out due to failed login/register attempts.
  return url.includes(API_PATHS.auth.login) || url.includes(API_PATHS.auth.register);
}

