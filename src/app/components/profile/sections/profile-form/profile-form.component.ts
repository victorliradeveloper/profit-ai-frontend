import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { getServerMessage } from '../../../../services/profile/profile-http.utils';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import { ProfileStateService } from '../../../../services/profile/profile-state.service';
import { LoggerService } from '../../../../services/logger/logger.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-form.component.html'
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userEmail: string | null = null;

  editedName: string = '';
  editedEmail: string = '';

  isEditing: boolean = false;
  isLoading: boolean = false;

  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly MIN_NAME_LENGTH = 2;

  constructor(
    private authService: AuthService,
    private profileSession: ProfileSessionService,
    public profileState: ProfileStateService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.profileState.destroy();
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

  startEditing(): void {
    this.isEditing = true;
    this.resetEditedFields();
    this.profileState.clear();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetEditedFields();
    this.profileState.clear();
  }

  saveProfile(): void {
    const nameError = this.validateName(this.editedName);
    if (nameError) {
      this.profileState.setError(nameError);
      return;
    }

    const emailError = this.validateEmail(this.editedEmail);
    if (emailError) {
      this.profileState.setError(emailError);
      return;
    }

    if (!this.hasChanges()) {
      this.profileState.setError('Nenhuma alteração foi feita');
      return;
    }

    this.isLoading = true;
    this.profileState.clear();

    const profileData = {
      name: this.editedName.trim(),
      email: this.editedEmail.trim()
    };

    this.authService.updateProfile(profileData).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: any) => {
        this.userName = response?.name || profileData.name;
        this.userEmail = response?.email || profileData.email;
        this.isEditing = false;
        this.profileState.setSuccess('Perfil atualizado com sucesso!');
      },
      error: (error: any) => {
        this.handleUpdateError(error);
      }
    });
  }

  logout(): void {
    this.profileSession.logoutToLogin();
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

  private handleUpdateError(error: any): void {
    if (error?.status === 401 || error?.status === 403) {
      this.profileState.setError('Sessão expirada. Por favor, faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }

    if (error?.status === 400) {
      const serverMessage = getServerMessage(error);
      this.profileState.setError(serverMessage || 'Dados inválidos. Verifique as informações.');
      return;
    }

    if (error?.status === 409) {
      this.profileState.setError('Este email já está em uso. Por favor, escolha outro.');
      return;
    }

    if (error?.status === 0 || error?.status >= 500) {
      this.profileState.setError('Erro no servidor. Tente novamente mais tarde.');
      return;
    }

    this.profileState.setError('Erro ao atualizar perfil. Tente novamente.');
    this.logger.error('Update profile error:', error);
  }
}

