import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionService {
  readonly DEFAULT_LOGOUT_DELAY_MS = 2000;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logoutToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  scheduleLogoutToLogin(delayMs: number = this.DEFAULT_LOGOUT_DELAY_MS): void {
    setTimeout(() => this.logoutToLogin(), delayMs);
  }
}

