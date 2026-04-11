import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, map, merge, startWith } from 'rxjs';

import { ApiErrorService } from '../../services/http/api-error.service';
import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';
import { LoggerService } from '../../services/logger/logger.service';

interface RegisterFormControls {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  terms: FormControl<boolean>;
}

function controlStringValue(control: AbstractControl | null): string {
  const v = control?.value;
  return typeof v === 'string' ? v : '';
}

function passwordsMatchGroupValidator(group: AbstractControl): ValidationErrors | null {
  const pwd = controlStringValue(group.get('password'));
  const confirmPwd = controlStringValue(group.get('confirmPassword'));
  if (!pwd || !confirmPwd) return null;
  return pwd !== confirmPwd ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  readonly ICONS = ICONS;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly SUCCESS_REDIRECT_DELAY = 1000;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  showPassword = false;
  showConfirmPassword = false;
  readonly isLoading = signal(false);
  submitAttempted = false;

  readonly form = this.createForm();

  /** Mirrors `form.valid` so templates/computeds react to value/status changes (signals). */
  private readonly formValid = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(
      map(() => this.form.valid),
      startWith(this.form.valid),
    ),
    { initialValue: this.form.valid },
  );

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly canSubmit = computed(() => this.formValid() && !this.isLoading());

  readonly passwordsMatch = computed(() => {
    this.formValid();
    return !this.form.hasError('passwordMismatch');
  });

  onSubmit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.setFormError(this.getValidationError());
      return;
    }

    this.executeRegister();
  }

  registerWithGoogle(): void {
    // Implement Google OAuth
  }

  get nameControl() {
    return this.form.controls.name;
  }
  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }
  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
  }
  get termsControl() {
    return this.form.controls.terms;
  }

  get nameError(): string | null {
    return this.getControlError(this.nameControl, { required: 'Nome é obrigatório' });
  }

  get emailError(): string | null {
    return this.getControlError(this.emailControl, {
      required: 'Email é obrigatório',
      email: 'Email inválido',
    });
  }

  get passwordError(): string | null {
    return this.getControlError(this.passwordControl, {
      required: 'Senha é obrigatória',
      minlength: `Senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
    });
  }

  get confirmPasswordError(): string | null {
    let error = this.getControlError(this.confirmPasswordControl, {
      required: 'Confirme a senha.',
    });
    if (!error && !this.passwordsMatch()) {
      error = 'As senhas não coincidem';
    }
    return error;
  }

  get termsError(): string | null {
    return this.getControlError(this.termsControl, {
      required: 'Você deve aceitar os termos de uso',
    });
  }

  private createForm(): FormGroup<RegisterFormControls> {
    return this.fb.group(
      {
        name: this.fb.nonNullable.control('', Validators.required),
        email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
        password: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(this.MIN_PASSWORD_LENGTH),
        ]),
        confirmPassword: this.fb.nonNullable.control('', Validators.required),
        terms: this.fb.nonNullable.control(false, Validators.requiredTrue),
      },
      { validators: passwordsMatchGroupValidator },
    );
  }

  private executeRegister(): void {
    const raw = this.form.getRawValue();
    this.isLoading.set(true);
    this.clearMessages();

    this.authService
      .register({
        name: raw.name.trim(),
        email: raw.email.trim().toLowerCase(),
        password: raw.password,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.handleRegisterSuccess(),
        error: (error: HttpErrorResponse) => this.handleRegisterError(error),
      });
  }

  private handleRegisterSuccess(): void {
    this.successMessage.set('Conta criada com sucesso! Redirecionando...');
    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, this.SUCCESS_REDIRECT_DELAY);
  }

  private handleRegisterError(error: HttpErrorResponse): void {
    this.logger.error('Register error:', error);

    if (error.status === 400) {
      const serverMsg = this.apiError.getServerMessage(error)?.toLowerCase() || '';
      if (serverMsg.includes('email')) {
        this.errorMessage.set('Email inválido. Verifique o formato.');
        return;
      }
    }

    this.errorMessage.set(
      this.apiError.message(error, {
        conflict: 'Este email já está cadastrado',
        networkError: 'Erro de conexão. Verifique o servidor.',
        fallback: 'Erro ao criar conta. Tente novamente.',
      }),
    );
  }

  private getValidationError(): string {
    if (this.form.hasError('passwordMismatch')) {
      return 'As senhas não coincidem';
    }
    if (this.passwordControl.errors?.['minlength']) {
      return `Senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`;
    }
    return 'Preencha todos os campos corretamente';
  }

  private getControlError(control: AbstractControl, errors: Record<string, string>): string | null {
    if (!control.invalid || !this.shouldShowError(control)) return null;
    for (const [key, message] of Object.entries(errors)) {
      if (control.hasError(key)) return message;
    }
    return null;
  }

  private shouldShowError(control: AbstractControl): boolean {
    return this.submitAttempted || control.touched || this.form.touched;
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private setFormError(message: string): void {
    this.errorMessage.set(message);
    this.successMessage.set('');
  }
}
