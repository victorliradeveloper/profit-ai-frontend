import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, Observable } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';
import { LoggerService } from '../../services/logger/logger.service';
import { ApiErrorService } from '../../services/http/api-error.service';

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Constants
  readonly ICONS = ICONS;

  // Services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly fb = inject(FormBuilder);

  // State
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  // Form
  readonly form = this.createForm();

  // Computed
  readonly isFormValid = computed(() => this.form.valid);
  readonly canSubmit = computed(() => this.isFormValid() && !this.isLoading);

  // Lifecycle
  constructor() {
    this.form.markAllAsTouched();
  }

  // Public API
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.setFormError('Por favor, preencha todos os campos');
      return;
    }

    this.executeLogin();
  }

  loginWithGoogle(): void {
    // Implementar autenticação Google
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Private Methods
  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  private executeLogin(): void {
    const credentials = this.form.getRawValue() as LoginCredentials;
    
    this.authService.login(credentials)
      .pipe(catchError(error => this.handleLoginError(error)))
      .subscribe({
        next: () => this.handleLoginSuccess()
      });
  }

  private setFormError(message: string): void {
    this.form.markAllAsTouched();
    this.errorMessage = message;
  }

  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    this.setLoading(false);
    this.errorMessage = this.apiError.message(error, {
      unauthorized: 'Email ou senha incorretos',
      notFound: 'Usuário não encontrado',
      fallback: 'Erro ao fazer login. Tente novamente.'
    });
    this.logger.error('Login error:', error);
    return EMPTY;
  }

  private handleLoginSuccess(): void {
    this.setLoading(false);
    this.router.navigate(['/profile']);
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  // Template helpers
  get emailControl() {
    return this.form.get('email');
  }

  get passwordControl() {
    return this.form.get('password');
  }
}