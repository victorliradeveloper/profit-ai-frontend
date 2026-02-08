import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ICONS } from '../../../../constants/icons';
import { AuthService } from '../../../../services/auth/auth.service';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import { ApiErrorService } from '../../../../services/http/api-error.service';

@Component({
  selector: 'app-change-password-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-section.component.html'
})
export class ChangePasswordSectionComponent implements OnDestroy {
  readonly ICONS = ICONS;

  isChangingPassword: boolean = false;
  isChangingPasswordLoading: boolean = false;
  passwordErrorMessage: string = '';
  passwordSuccessMessage: string = '';

  readonly passwordForm: UntypedFormGroup;

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordSubmitAttempted: boolean = false;

  private readonly MIN_PASSWORD_LENGTH = 6;
  private passwordMessageTimeout?: ReturnType<typeof setTimeout>;
  private formSub?: Subscription;

  constructor(
    private authService: AuthService,
    private profileSession: ProfileSessionService,
    private logger: LoggerService,
    private apiError: ApiErrorService,
    private fb: UntypedFormBuilder
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
      },
      {
        validators: [this.passwordsMatchValidator, this.newDifferentFromCurrentValidator],
      }
    );

    this.formSub = this.passwordForm.valueChanges.subscribe(() => {
      if (this.passwordErrorMessage || this.passwordSuccessMessage) {
        this.clearPasswordMessages();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearPasswordMessageTimeout();
    this.formSub?.unsubscribe();
  }

  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.passwordSubmitAttempted = false;
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
    this.clearPasswordMessages();
  }

  cancelChangingPassword(): void {
    this.isChangingPassword = false;
    this.passwordSubmitAttempted = false;
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
    this.clearPasswordMessages();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordInput(): void {
    if (this.passwordErrorMessage || this.passwordSuccessMessage) {
      this.clearPasswordMessages();
    }
  }

  private readonly passwordsMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value as string | undefined;
    const confirmPassword = control.get('confirmPassword')?.value as string | undefined;
    if (!newPassword || !confirmPassword) return null;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  };

  private readonly newDifferentFromCurrentValidator = (control: AbstractControl): ValidationErrors | null => {
    const currentPassword = control.get('currentPassword')?.value as string | undefined;
    const newPassword = control.get('newPassword')?.value as string | undefined;
    if (!currentPassword || !newPassword) return null;
    return currentPassword === newPassword ? { sameAsCurrent: true } : null;
  };

  private shouldShowError(control: AbstractControl | null): boolean {
    if (!control) return false;
    return this.passwordSubmitAttempted || control.touched;
  }

  get currentPasswordValidationError(): string | null {
    const c = this.passwordForm.get('currentPassword');
    if (!this.shouldShowError(c)) return null;
    if (c?.hasError('required')) return 'Informe sua senha atual.';
    return null;
  }

  get newPasswordValidationError(): string | null {
    const c = this.passwordForm.get('newPassword');
    if (!this.shouldShowError(c)) return null;
    if (c?.hasError('required')) return 'A senha é obrigatória';
    if (c?.hasError('minlength')) {
      return `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (this.passwordForm.hasError('sameAsCurrent')) return 'A nova senha deve ser diferente da senha atual.';
    return null;
  }

  get confirmPasswordValidationError(): string | null {
    const c = this.passwordForm.get('confirmPassword');
    if (!this.shouldShowError(c)) return null;
    if (c?.hasError('required')) return 'Confirme a nova senha.';
    if (c?.hasError('minlength')) {
      return `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (this.passwordForm.hasError('passwordMismatch')) return 'As senhas não coincidem.';
    return null;
  }

  get canSubmitPasswordChange(): boolean {
    return this.passwordForm.valid && !this.isChangingPasswordLoading;
  }

  get newPasswordStrength(): { score: number; label: string; barClass: string; textClass: string } {
    const pwd = (this.passwordForm.get('newPassword')?.value as string) || '';
    if (!pwd) {
      return { score: 0, label: '—', barClass: 'bg-gray-200', textClass: 'text-gray-500' };
    }

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    const len = pwd.length;

    let score = 0;
    if (len >= this.MIN_PASSWORD_LENGTH) score += 1;
    if (len >= 10) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasDigit) score += 1;
    if (hasSymbol) score += 1;
    score = Math.min(score, 4);

    if (score <= 1) return { score, label: 'Fraca', barClass: 'bg-red-500', textClass: 'text-red-600' };
    if (score === 2) return { score, label: 'Média', barClass: 'bg-yellow-500', textClass: 'text-yellow-700' };
    if (score === 3) return { score, label: 'Boa', barClass: 'bg-green-500', textClass: 'text-green-600' };
    return { score, label: 'Forte', barClass: 'bg-emerald-600', textClass: 'text-emerald-700' };
  }

  get newPasswordRequirements(): Array<{ label: string; ok: boolean }> {
    const pwd = (this.passwordForm.get('newPassword')?.value as string) || '';
    const current = (this.passwordForm.get('currentPassword')?.value as string) || '';
    return [
      { label: `Mínimo de ${this.MIN_PASSWORD_LENGTH} caracteres`, ok: pwd.length >= this.MIN_PASSWORD_LENGTH },
      { label: 'Pelo menos 1 letra maiúscula e 1 minúscula', ok: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) },
      { label: 'Pelo menos 1 número', ok: /\d/.test(pwd) },
      { label: 'Pelo menos 1 caractere especial', ok: /[^A-Za-z0-9]/.test(pwd) },
      { label: 'Diferente da senha atual', ok: !pwd || !current || pwd !== current },
    ];
  }

  changePassword(): void {
    this.passwordSubmitAttempted = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPasswordLoading = true;
    this.clearPasswordMessages();
    this.passwordForm.disable({ emitEvent: false });

    const { currentPassword, newPassword } = this.passwordForm.getRawValue() as {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };

    this.authService.changePassword({
      currentPassword,
      newPassword,
    }).pipe(
      finalize(() => {
        this.isChangingPasswordLoading = false;
        this.passwordForm.enable({ emitEvent: false });
      })
    ).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSubmitAttempted = false;
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.passwordForm.markAsUntouched();
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        this.showPasswordSuccessMessage('Senha alterada com sucesso!');
      },
      error: (error: HttpErrorResponse) => {
        this.handlePasswordChangeError(error);
      }
    });
  }

  private clearPasswordMessages(): void {
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
    this.clearPasswordMessageTimeout();
  }

  private clearPasswordMessageTimeout(): void {
    if (this.passwordMessageTimeout) {
      clearTimeout(this.passwordMessageTimeout);
      this.passwordMessageTimeout = undefined;
    }
  }

  private showPasswordSuccessMessage(message: string, duration: number = 3000): void {
    this.passwordSuccessMessage = message;
    this.passwordErrorMessage = '';
    this.clearPasswordMessageTimeout();
    this.passwordMessageTimeout = setTimeout(() => {
      this.passwordSuccessMessage = '';
    }, duration);
  }

  private showPasswordErrorMessage(message: string): void {
    this.passwordErrorMessage = message;
    this.passwordSuccessMessage = '';
    this.clearPasswordMessageTimeout();
  }

  private handlePasswordChangeError(error: HttpErrorResponse): void {
    if (error?.status === 401) {
      this.showPasswordErrorMessage('Senha atual incorreta.');
      return;
    }

    if (error?.status === 403) {
      this.showPasswordErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }

    this.showPasswordErrorMessage(this.apiError.message(error, {
      fallback: 'Erro ao alterar senha. Tente novamente.'
    }));
    this.logger.error('Change password error:', error);
  }
}

