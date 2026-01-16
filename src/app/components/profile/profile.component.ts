import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userEmail: string | null = null;
  
  // Campos editáveis
  editedName: string = '';
  editedEmail: string = '';
  
  // Estado de edição
  isEditing: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly MIN_NAME_LENGTH = 2;
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

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Atualizar com a resposta do servidor ou com os dados enviados
        this.userName = response?.name || profileData.name;
        this.userEmail = response?.email || profileData.email;
        this.isEditing = false;
        this.showSuccessMessage('Perfil atualizado com sucesso!');
      },
      error: (error) => {
        this.isLoading = false;
        this.handleUpdateError(error);
      }
    });
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

