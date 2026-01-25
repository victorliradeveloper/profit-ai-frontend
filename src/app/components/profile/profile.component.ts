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

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly MIN_NAME_LENGTH = 2;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private messageTimeout?: ReturnType<typeof setTimeout>;

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
    this.clearMessages();
  }

  cancelChangingPassword(): void {
    this.isChangingPassword = false;
    this.resetPasswordFields();
    this.clearMessages();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword) {
      this.showErrorMessage('Por favor, informe sua senha atual');
      return;
    }

    const newPasswordError = this.validatePassword(this.passwordData.newPassword);
    if (newPasswordError) {
      this.showErrorMessage(newPasswordError);
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showErrorMessage('As senhas não coincidem');
      return;
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.showErrorMessage('A nova senha deve ser diferente da senha atual');
      return;
    }

    this.isChangingPasswordLoading = true;
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
        this.showSuccessMessage('Senha alterada com sucesso!');
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
      this.showErrorMessage('Senha atual incorreta.');
      return;
    }

    if (error.status === 403) {
      this.showErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      setTimeout(() => {
        this.logout();
      }, 2000);
      return;
    }

    if (error.status === 400) {
      const serverMessage = error.error?.message || error.error?.error;
      this.showErrorMessage(serverMessage || 'Dados inválidos. Verifique as informações.');
      return;
    }

    if (error.status === 0 || error.status >= 500) {
      this.showErrorMessage('Erro no servidor. Tente novamente mais tarde.');
      return;
    }

    this.showErrorMessage('Erro ao alterar senha. Tente novamente.');
    console.error('Change password error:', error);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

