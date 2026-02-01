import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { finalize } from 'rxjs';
import { ICONS } from '../../constants/icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  readonly ICONS = ICONS;
  userName: string | null = null;
  userEmail: string | null = null;
  
  // Campos editáveis
  editedName: string = '';
  editedEmail: string = '';
  
  // Estado de edição
  isEditing: boolean = false;
  isLoading: boolean = false;
  isChangingPassword: boolean = false;
  isChangingPasswordLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
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

  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly MIN_NAME_LENGTH = 2;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private messageTimeout?: ReturnType<typeof setTimeout>;
  private passwordMessageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.clearMessageTimeout();
    this.clearPasswordMessageTimeout();
  }

  private loadUserData(): void {
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    this.resetEditedFields();
  }

  private resetEditedFields(): void {
    this.editedName = this.userName || '';
    this.editedEmail = this.userEmail || '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.clearMessageTimeout();
  }

  private clearMessageTimeout(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = undefined;
    }
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
  
  

  private showSuccessMessage(message: string, duration: number = 3000): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.clearMessageTimeout();
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
    }, duration);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.clearMessageTimeout();
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

  private validateName(name: string): string | null {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'O nome é obrigatório';
    }
    if (trimmedName.length < this.MIN_NAME_LENGTH) {
      return `O nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres`;
    }
    return null;
  }

  private validateEmail(email: string): string | null {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return 'O email é obrigatório';
    }
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return 'Por favor, insira um email válido';
    }
    return null;
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

  private hasChanges(): boolean {
    const nameChanged = this.editedName.trim() !== (this.userName || '');
    const emailChanged = this.editedEmail.trim() !== (this.userEmail || '');
    return nameChanged || emailChanged;
  }

  startEditing(): void {
    this.isEditing = true;
    this.resetEditedFields();
    this.clearMessages();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetEditedFields();
    this.clearMessages();
  }

  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.resetPasswordFields();
    this.passwordSubmitAttempted = false;
    this.passwordTouched = { current: false, new: false, confirm: false };
    this.clearMessages();
    this.clearPasswordMessages();
  }

  cancelChangingPassword(): void {
    this.isChangingPassword = false;
    this.resetPasswordFields();
    this.passwordSubmitAttempted = false;
    this.passwordTouched = { current: false, new: false, confirm: false };
    this.clearPasswordMessages();
    this.clearMessages();
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
    // Evita mensagens "presas" após erro do servidor enquanto o usuário ajusta os campos
    if (this.passwordErrorMessage || this.passwordSuccessMessage) {
      this.clearPasswordMessages();
    }
  }

  private shouldShowPasswordError(field: 'current' | 'new' | 'confirm'): boolean {
    return this.passwordSubmitAttempted || this.passwordTouched[field];
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
    this.clearMessages();

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

  saveProfile(): void {
    // Validações
    const nameError = this.validateName(this.editedName);
    if (nameError) {
      this.showErrorMessage(nameError);
      return;
    }

    const emailError = this.validateEmail(this.editedEmail);
    if (emailError) {
      this.showErrorMessage(emailError);
      return;
    }

    // Verificar se houve mudanças
    if (!this.hasChanges()) {
      this.showErrorMessage('Nenhuma alteração foi feita');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const profileData = {
      name: this.editedName.trim(),
      email: this.editedEmail.trim()
    };

    this.authService.updateProfile(profileData).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        // Atualizar com a resposta do servidor ou com os dados enviados
        this.userName = response?.name || profileData.name;
        this.userEmail = response?.email || profileData.email;
        this.isEditing = false;
        this.showSuccessMessage('Perfil atualizado com sucesso!');
      },
      error: (error) => {
        this.handleUpdateError(error);
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

  private handleUpdateError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.showErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      setTimeout(() => {
        this.logout();
      }, 2000);
    } else if (error.status === 400) {
      const serverMessage = error.error?.message || error.error?.error;
      this.showErrorMessage(serverMessage || 'Dados inválidos. Verifique as informações.');
    } else if (error.status === 409) {
      this.showErrorMessage('Este email já está em uso. Por favor, escolha outro.');
    } else if (error.status === 0 || error.status >= 500) {
      this.showErrorMessage('Erro no servidor. Tente novamente mais tarde.');
    } else {
      this.showErrorMessage('Erro ao atualizar perfil. Tente novamente.');
    }
    console.error('Update profile error:', error);
  }

  private handlePasswordChangeError(error: any): void {
    if (error.status === 401) {
      this.showPasswordErrorMessage('Senha atual incorreta.');
      return;
    }

    if (error.status === 403) {
      this.showPasswordErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      setTimeout(() => {
        this.logout();
      }, 2000);
      return;
    }

    if (error.status === 400) {
      const serverMessage = error.error?.message || error.error?.error;
      this.showPasswordErrorMessage(serverMessage || 'Dados inválidos. Verifique as informações.');
      return;
    }

    if (error.status === 0 || error.status >= 500) {
      this.showPasswordErrorMessage('Erro no servidor. Tente novamente mais tarde.');
      return;
    }

    this.showPasswordErrorMessage('Erro ao alterar senha. Tente novamente.');
    console.error('Change password error:', error);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

