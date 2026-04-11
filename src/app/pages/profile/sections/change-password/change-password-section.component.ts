import { CommonModule } from '@angular/common';
import { Component, inject, DestroyRef, effect, signal, computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, merge, startWith } from 'rxjs';

import { AuthService } from '../../../../services/auth/auth.service';
import { ICONS } from '../../../../constants/icons';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import { ApiErrorService } from '../../../../services/http/api-error.service';

/** Control map for typed `FormGroup` (not the raw value shape). */
interface PasswordFormControls {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

interface PasswordStrength {
  score: number;
  label: string;
  barClass: string;
}

interface PasswordRequirement {
  label: string;
  ok: boolean;
}

@Component({
  selector: 'app-change-password-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-section.component.html',
})
export class ChangePasswordSectionComponent {
  // Constants
  readonly ICONS = ICONS;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly SUCCESS_MESSAGE_DURATION = 3000;

  // Services
  private readonly authService = inject(AuthService);
  private readonly profileSession = inject(ProfileSessionService);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // State
  isChangingPassword = false;
  isChangingPasswordLoading = false;
  passwordSubmitAttempted = false;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Form
  readonly passwordForm = this.createPasswordForm();

  /** Recomputed when password fields change (computed() does not track FormControl values). */
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

  /** Bumps when any control value/status changes so validity-based computeds stay fresh. */
  private readonly passwordFormValidityTick = toSignal(
    merge(
      this.passwordForm.valueChanges,
      this.passwordForm.statusChanges,
    ).pipe(map(() => undefined), startWith(undefined)),
    { initialValue: undefined },
  );

  // UI State
  readonly passwordErrorMessage = signal('');
  readonly passwordSuccessMessage = signal('');

  // Computed
  readonly canSubmitPasswordChange = computed(() => {
    this.passwordFormValidityTick();
    return this.passwordForm.valid && !this.isChangingPasswordLoading;
  });

  readonly newPasswordStrength = computed(() =>
    this.calculatePasswordStrength(this.newPasswordValue() ?? ''),
  );

  readonly newPasswordRequirements = computed(() =>
    this.calculatePasswordRequirements(
      this.newPasswordValue() ?? '',
      this.currentPasswordValue() ?? '',
    ),
  );

  // Effects (auto-cleanup!)
  constructor() {
    effect(() => {
      if (this.passwordErrorMessage() || this.passwordSuccessMessage()) {
        this.passwordForm.markAsDirty();
      }
    }, { allowSignalWrites: true });
  }

  // Public API
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

  /** Clears API/banner messages while the user edits the form. */
  onPasswordInput(): void {
    this.clearPasswordMessages();
  }

  // Getters (Template Helpers)
  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  get currentPasswordError(): string | null {
    return this.getControlError(this.currentPasswordControl, {
      required: 'Informe sua senha atual.'
    });
  }

  get newPasswordError(): string | null {
    const control = this.newPasswordControl;
    const field = this.getControlError(control, {
      required: 'A senha é obrigatória',
      minlength: `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
    });
    if (field) return field;
    if (control && this.shouldShowError(control) && this.passwordForm.hasError('sameAsCurrent')) {
      return 'A nova senha deve ser diferente da atual.';
    }
    return null;
  }

  get confirmPasswordError(): string | null {
    const control = this.confirmPasswordControl;
    const field = this.getControlError(control, {
      required: 'Confirme a nova senha.',
      minlength: `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
    });
    if (field) return field;
    if (control && this.shouldShowError(control) && this.passwordForm.hasError('passwordMismatch')) {
      return 'As senhas não coincidem.';
    }
    return null;
  }

  // Private Methods
  private createPasswordForm(): FormGroup<PasswordFormControls> {
    return this.fb.group({
      currentPassword: this.fb.nonNullable.control('', Validators.required),
      newPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(this.MIN_PASSWORD_LENGTH),
      ]),
      confirmPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(this.MIN_PASSWORD_LENGTH),
      ]),
    }, {
      validators: [
        this.passwordsMatchValidator.bind(this),
        this.newDifferentFromCurrentValidator.bind(this),
      ],
    });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = this.valueAsString(control.get('newPassword'));
    const confirmPassword = this.valueAsString(control.get('confirmPassword'));
    
    if (!newPassword || !confirmPassword) return null;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private newDifferentFromCurrentValidator(control: AbstractControl): ValidationErrors | null {
    const currentPassword = this.valueAsString(control.get('currentPassword'));
    const newPassword = this.valueAsString(control.get('newPassword'));
    
    if (!currentPassword || !newPassword) return null;
    return currentPassword === newPassword ? { sameAsCurrent: true } : null;
  }

  private executePasswordChange(): void {
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    
    this.isChangingPasswordLoading = true;
    this.clearPasswordMessages();
    this.passwordForm.disable({ emitEvent: false });

    this.authService.changePassword({ currentPassword, newPassword })
      .pipe(
        finalize(() => this.resetPasswordChangeState()),
        takeUntilDestroyed(this.destroyRef)
      )
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
      this.apiError.message(error, { fallback: 'Erro ao alterar senha. Tente novamente.' })
    );
    this.logger.error('Change password error:', error);
  }

  private getControlError(control: AbstractControl | null, errors: Record<string, string>): string | null {
    if (!control?.invalid || !this.shouldShowError(control)) return null;
    
    for (const [errorKey, message] of Object.entries(errors)) {
      if (control.hasError(errorKey)) return message;
    }
    
    return null;
  }

  private shouldShowError(control: AbstractControl): boolean {
    return this.passwordSubmitAttempted || control.touched;
  }

  private valueAsString(control: AbstractControl | null): string {
    const value = control?.value;
    return typeof value === 'string' ? value : '';
  }

  private calculatePasswordStrength(pwd: string): PasswordStrength {
    if (!pwd) {
      return { score: 0, label: '—', barClass: 'bg-gray-200' };
    }

    const checks = [
      pwd.length >= this.MIN_PASSWORD_LENGTH,
      pwd.length >= 10,
      /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
    ];

    const passedCount = Math.min(checks.filter(Boolean).length, 5);
    /** 0 = nenhum critério; 1–5 = quantos critérios de força passaram (rótulos têm 5 níveis, índices 0–4). */
    const tierIndex = Math.max(0, Math.min(passedCount - 1, 4));

    const labels = ['Fraca', 'Média', 'Boa', 'Forte', 'Excelente'];
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600', 'bg-blue-600'];

    return {
      score: passedCount,
      label: labels[tierIndex],
      barClass: colors[tierIndex],
    };
  }

  private calculatePasswordRequirements(pwd: string, current: string): PasswordRequirement[] {
    return [
      { 
        label: `Mínimo de ${this.MIN_PASSWORD_LENGTH} caracteres`, 
        ok: pwd.length >= this.MIN_PASSWORD_LENGTH 
      },
      { 
        label: '1 letra maiúscula e 1 minúscula', 
        ok: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) 
      },
      { label: 'Pelo menos 1 número', ok: /\d/.test(pwd) },
      { label: 'Pelo menos 1 caractere especial', ok: /[^A-Za-z0-9]/.test(pwd) },
      { label: 'Diferente da senha atual', ok: pwd !== current },
    ];
  }

  private clearPasswordMessages(): void {
    this.passwordErrorMessage.set('');
    this.passwordSuccessMessage.set('');
  }

  private showPasswordSuccessMessage(message: string): void {
    this.passwordSuccessMessage.set(message);
    this.passwordErrorMessage.set('');
    
    setTimeout(() => {
      this.passwordSuccessMessage.set('');
    }, this.SUCCESS_MESSAGE_DURATION);
  }

  private showPasswordErrorMessage(message: string): void {
    this.passwordErrorMessage.set(message);
    this.passwordSuccessMessage.set('');
  }
}