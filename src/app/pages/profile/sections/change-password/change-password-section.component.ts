import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, map, merge, startWith } from 'rxjs';

import { ApiErrorService } from '../../../../services/http/api-error.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ICONS } from '../../../../constants/icons';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import {
  passwordsMismatchCrossFieldValidator,
  sameAsCurrentCrossFieldValidator,
} from './change-password-cross-field.validators';
import type { PasswordFormControls } from './change-password-section.types';
import {
  calculatePasswordRequirements,
  calculatePasswordStrength,
} from './password-strength.utils';

@Component({
  selector: 'app-change-password-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-section.component.html',
})
export class ChangePasswordSectionComponent {
  // --- Constants & icons ---
  readonly ICONS = ICONS;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly SUCCESS_MESSAGE_DURATION = 3000;

  // --- Injected services ---
  private readonly authService = inject(AuthService);
  private readonly profileSession = inject(ProfileSessionService);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // --- UI flags (non-signal) ---
  isChangingPassword = false;
  isChangingPasswordLoading = false;
  passwordSubmitAttempted = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // --- Form + reactive bridge (computed does not track FormControl values) ---
  readonly passwordForm = this.createPasswordForm();

  private readonly newPasswordValue = toSignal(
    this.passwordForm.controls.newPassword.valueChanges.pipe(
      startWith(this.passwordForm.controls.newPassword.value),
    ),
    { initialValue: this.passwordForm.controls.newPassword.value },
  );

  private readonly currentPasswordValue = toSignal(
    this.passwordForm.controls.currentPassword.valueChanges.pipe(
      startWith(this.passwordForm.controls.currentPassword.value),
    ),
    { initialValue: this.passwordForm.controls.currentPassword.value },
  );

  private readonly passwordFormValidityTick = toSignal(
    merge(this.passwordForm.valueChanges, this.passwordForm.statusChanges).pipe(
      map(() => undefined),
      startWith(undefined),
    ),
    { initialValue: undefined },
  );

  // --- Banner messages ---
  readonly passwordErrorMessage = signal('');
  readonly passwordSuccessMessage = signal('');

  // --- Computed ---
  readonly canSubmitPasswordChange = computed(() => {
    this.passwordFormValidityTick();
    return this.passwordForm.valid && !this.isChangingPasswordLoading;
  });

  readonly newPasswordStrength = computed(() =>
    calculatePasswordStrength(this.newPasswordValue() ?? '', this.MIN_PASSWORD_LENGTH),
  );

  readonly newPasswordRequirements = computed(() =>
    calculatePasswordRequirements(
      this.newPasswordValue() ?? '',
      this.currentPasswordValue() ?? '',
      this.MIN_PASSWORD_LENGTH,
    ),
  );

  constructor() {
    effect(
      () => {
        if (this.passwordErrorMessage() || this.passwordSuccessMessage()) {
          this.passwordForm.markAsDirty();
        }
      },
      { allowSignalWrites: true },
    );
  }

  // --- Public API ---
  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.passwordSubmitAttempted = false;
    this.resetForm();
    this.clearPasswordMessages();
  }

  cancelChangingPassword(): void {
    this.isChangingPassword = false;
    this.passwordSubmitAttempted = false;
    this.resetForm();
    this.clearPasswordMessages();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  changePassword(): void {
    this.passwordSubmitAttempted = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.executePasswordChange();
  }

  onPasswordInput(): void {
    this.clearPasswordMessages();
  }

  // --- Template: controls & errors ---
  get currentPasswordControl() {
    return this.passwordForm.controls.currentPassword;
  }

  get newPasswordControl() {
    return this.passwordForm.controls.newPassword;
  }

  get confirmPasswordControl() {
    return this.passwordForm.controls.confirmPassword;
  }

  get currentPasswordError(): string | null {
    return this.fieldError(this.currentPasswordControl, {
      required: 'Informe sua senha atual.',
    });
  }

  get newPasswordError(): string | null {
    const control = this.newPasswordControl;
    const field = this.fieldError(control, {
      required: 'A senha é obrigatória',
      minlength: `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
    });
    if (field) return field;
    if (this.shouldShowError(control) && this.passwordForm.hasError('sameAsCurrent')) {
      return 'A nova senha deve ser diferente da atual.';
    }
    return null;
  }

  get confirmPasswordError(): string | null {
    const control = this.confirmPasswordControl;
    const field = this.fieldError(control, {
      required: 'Confirme a nova senha.',
      minlength: `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
    });
    if (field) return field;
    if (this.shouldShowError(control) && this.passwordForm.hasError('passwordMismatch')) {
      return 'As senhas não coincidem.';
    }
    return null;
  }

  // --- Form factory ---
  private createPasswordForm(): FormGroup<PasswordFormControls> {
    return this.fb.group(
      {
        currentPassword: this.fb.nonNullable.control('', Validators.required),
        newPassword: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(this.MIN_PASSWORD_LENGTH),
        ]),
        confirmPassword: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(this.MIN_PASSWORD_LENGTH),
        ]),
      },
      {
        validators: [passwordsMismatchCrossFieldValidator, sameAsCurrentCrossFieldValidator],
      },
    );
  }

  // --- Submit flow ---
  private executePasswordChange(): void {
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.isChangingPasswordLoading = true;
    this.clearPasswordMessages();
    this.passwordForm.disable({ emitEvent: false });

    this.authService
      .changePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.resetPasswordChangeState()), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handlePasswordChangeSuccess(),
        error: (error: HttpErrorResponse) => this.handlePasswordChangeError(error),
      });
  }

  private resetPasswordChangeState(): void {
    this.isChangingPasswordLoading = false;
    this.passwordForm.enable({ emitEvent: false });
  }

  private resetForm(): void {
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
  }

  private handlePasswordChangeSuccess(): void {
    this.cancelChangingPassword();
    this.showPasswordSuccessMessage('Senha alterada com sucesso!');
  }

  private handlePasswordChangeError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.showPasswordErrorMessage('Senha atual incorreta.');
      return;
    }
    if (error.status === 403) {
      this.showPasswordErrorMessage('Sessão expirada. Faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }
    this.showPasswordErrorMessage(
      this.apiError.message(error, { fallback: 'Erro ao alterar senha. Tente novamente.' }),
    );
    this.logger.error('Change password error:', error);
  }

  // --- Field error helpers ---
  private fieldError(control: AbstractControl, messages: Record<string, string>): string | null {
    if (!control.invalid || !this.shouldShowError(control)) return null;
    for (const [errorKey, message] of Object.entries(messages)) {
      if (control.hasError(errorKey)) return message;
    }
    return null;
  }

  private shouldShowError(control: AbstractControl): boolean {
    return this.passwordSubmitAttempted || control.touched;
  }

  // --- Banner messages ---
  private clearPasswordMessages(): void {
    this.passwordErrorMessage.set('');
    this.passwordSuccessMessage.set('');
  }

  private showPasswordSuccessMessage(message: string): void {
    this.passwordSuccessMessage.set(message);
    this.passwordErrorMessage.set('');
    setTimeout(() => this.passwordSuccessMessage.set(''), this.SUCCESS_MESSAGE_DURATION);
  }

  private showPasswordErrorMessage(message: string): void {
    this.passwordErrorMessage.set(message);
    this.passwordSuccessMessage.set('');
  }
}
