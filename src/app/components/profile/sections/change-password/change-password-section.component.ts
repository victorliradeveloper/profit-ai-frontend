import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ICONS } from '../../../../constants/icons';
import { AuthService } from '../../../../services/auth/auth.service';
import { getServerMessage } from '../../shared/profile-http.utils';
import { ProfileSessionService } from '../../shared/profile-session.service';

@Component({
  selector: 'app-change-password-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-section.component.html'
})
export class ChangePasswordSectionComponent implements OnDestroy {
  readonly ICONS = ICONS;

  isChangingPassword: boolean = false;
  isChangingPasswordLoading: boolean = false;
  passwordErrorMessage: string = '';
  passwordSuccessMessage: string = '';

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordTouched = {
    current: false,
    new: false,
    confirm: false
  };
  passwordSubmitAttempted: boolean = false;

  private readonly MIN_PASSWORD_LENGTH = 6;
  private passwordMessageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private profileSession: ProfileSessionService
  ) {}

  ngOnDestroy(): void {
    this.clearPasswordMessageTimeout();
  }

  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.resetPasswordFields();
    this.passwordSubmitAttempted = false;
    this.passwordTouched = { current: false, new: false, confirm: false };
    this.clearPasswordMessages();
  }

  cancelChangingPassword(): void {
    this.isChangingPassword = false;
    this.resetPasswordFields();
    this.passwordSubmitAttempted = false;
    this.passwordTouched = { current: false, new: false, confirm: false };
    this.clearPasswordMessages();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  markPasswordTouched(field: 'current' | 'new' | 'confirm'): void {
    this.passwordTouched[field] = true;
  }

  onPasswordInput(): void {
    if (this.passwordErrorMessage || this.passwordSuccessMessage) {
      this.clearPasswordMessages();
    }
  }

  private shouldShowPasswordError(field: 'current' | 'new' | 'confirm'): boolean {
    return this.passwordSubmitAttempted || this.passwordTouched[field];
  }

  private validatePassword(password: string): string | null {
    if (!password) {
      return 'A senha é obrigatória';
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      return `A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`;
    }
    return null;
  }

  private getPasswordErrorsRaw(): { current?: string; new?: string; confirm?: string } {
    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!this.passwordData.currentPassword) {
      errors.current = 'Informe sua senha atual.';
    }

    const newPasswordError = this.validatePassword(this.passwordData.newPassword);
    if (newPasswordError) {
      errors.new = newPasswordError;
    }

    if (!this.passwordData.confirmPassword) {
      errors.confirm = 'Confirme a nova senha.';
    } else if (this.passwordData.newPassword && this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      errors.confirm = 'As senhas não coincidem.';
    }

    if (
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.currentPassword === this.passwordData.newPassword
    ) {
      errors.new = 'A nova senha deve ser diferente da senha atual.';
    }

    return errors;
  }

  get currentPasswordValidationError(): string | null {
    const error = this.getPasswordErrorsRaw().current;
    return this.shouldShowPasswordError('current') ? (error || null) : null;
  }

  get newPasswordValidationError(): string | null {
    const error = this.getPasswordErrorsRaw().new;
    return this.shouldShowPasswordError('new') ? (error || null) : null;
  }

  get confirmPasswordValidationError(): string | null {
    const error = this.getPasswordErrorsRaw().confirm;
    return this.shouldShowPasswordError('confirm') ? (error || null) : null;
  }

  get canSubmitPasswordChange(): boolean {
    const errors = this.getPasswordErrorsRaw();
    return !errors.current && !errors.new && !errors.confirm && !this.isChangingPasswordLoading;
  }

  get newPasswordStrength(): { score: number; label: string; barClass: string; textClass: string } {
    const pwd = this.passwordData.newPassword || '';
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
    const pwd = this.passwordData.newPassword || '';
    return [
      { label: `Mínimo de ${this.MIN_PASSWORD_LENGTH} caracteres`, ok: pwd.length >= this.MIN_PASSWORD_LENGTH },
      { label: 'Pelo menos 1 letra maiúscula e 1 minúscula', ok: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) },
      { label: 'Pelo menos 1 número', ok: /\d/.test(pwd) },
      { label: 'Pelo menos 1 caractere especial', ok: /[^A-Za-z0-9]/.test(pwd) },
      { label: 'Diferente da senha atual', ok: !pwd || !this.passwordData.currentPassword || pwd !== this.passwordData.currentPassword }
    ];
  }

  changePassword(): void {
    this.passwordSubmitAttempted = true;
    const errors = this.getPasswordErrorsRaw();
    if (errors.current || errors.new || errors.confirm) return;

    this.isChangingPasswordLoading = true;
    this.clearPasswordMessages();

    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).pipe(
      finalize(() => {
        this.isChangingPasswordLoading = false;
      })
    ).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.resetPasswordFields();
        this.passwordSubmitAttempted = false;
        this.passwordTouched = { current: false, new: false, confirm: false };
        this.showPasswordSuccessMessage('Senha alterada com sucesso!');
      },
      error: (error: any) => {
        this.handlePasswordChangeError(error);
      }
    });
  }

  private resetPasswordFields(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
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

  private handlePasswordChangeError(error: any): void {
    if (error?.status === 401) {
      this.showPasswordErrorMessage('Senha atual incorreta.');
      return;
    }

    if (error?.status === 403) {
      this.showPasswordErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }

    if (error?.status === 400) {
      const serverMessage = getServerMessage(error);
      this.showPasswordErrorMessage(serverMessage || 'Dados inválidos. Verifique as informações.');
      return;
    }

    if (error?.status === 0 || error?.status >= 500) {
      this.showPasswordErrorMessage('Erro no servidor. Tente novamente mais tarde.');
      return;
    }

    this.showPasswordErrorMessage('Erro ao alterar senha. Tente novamente.');
    console.error('Change password error:', error);
  }
}

