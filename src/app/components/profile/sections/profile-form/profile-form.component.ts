import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import { ProfileStateService } from '../../../../services/profile/profile-state.service';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ApiErrorService } from '../../../../services/http/api-error.service';
import { UpdateProfileResponse } from '../../../../services/auth/auth.types';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html'
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userEmail: string | null = null;

  isEditing: boolean = false;
  isLoading: boolean = false;
  submitAttempted: boolean = false;

  private readonly MIN_NAME_LENGTH = 2;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(this.MIN_NAME_LENGTH)]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private authService: AuthService,
    private profileSession: ProfileSessionService,
    public profileState: ProfileStateService,
    private logger: LoggerService,
    private apiError: ApiErrorService,
    private fb: FormBuilder
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
    this.resetFormFields();
  }

  private resetFormFields(): void {
    this.form.reset(
      {
        name: this.userName || '',
        email: this.userEmail || ''
      },
      { emitEvent: false }
    );
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitAttempted = false;
  }

  startEditing(): void {
    this.isEditing = true;
    this.resetFormFields();
    this.profileState.clear();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetFormFields();
    this.profileState.clear();
  }

  saveProfile(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const msg = this.validationMessage();
      this.profileState.setError(msg);
      return;
    }

    if (!this.hasChanges()) {
      this.profileState.setError('Nenhuma alteração foi feita');
      return;
    }

    this.isLoading = true;
    this.profileState.clear();

    const value = this.form.getRawValue();
    const profileData = {
      name: value.name!.trim(),
      email: value.email!.trim()
    };

    this.authService.updateProfile(profileData).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: UpdateProfileResponse) => {
        this.userName = response.name || profileData.name;
        this.userEmail = response.email || profileData.email;
        this.isEditing = false;
        this.resetFormFields();
        this.profileState.setSuccess('Perfil atualizado com sucesso!');
      },
      error: (error: HttpErrorResponse) => {
        this.handleUpdateError(error);
      }
    });
  }

  logout(): void {
    this.profileSession.logoutToLogin();
  }

  private hasChanges(): boolean {
    const value = this.form.getRawValue();
    const nameChanged = (value.name || '').trim() !== (this.userName || '');
    const emailChanged = (value.email || '').trim() !== (this.userEmail || '');
    return nameChanged || emailChanged;
  }

  get nameControl() {
    return this.form.controls.name;
  }

  get emailControl() {
    return this.form.controls.email;
  }

  private validationMessage(): string {
    if (this.nameControl.errors?.['required']) return 'O nome é obrigatório';
    if (this.nameControl.errors?.['minlength']) return `O nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres`;
    if (this.emailControl.errors?.['required']) return 'O email é obrigatório';
    if (this.emailControl.errors?.['email']) return 'Por favor, insira um email válido';
    return 'Dados inválidos. Verifique as informações.';
  }

  private handleUpdateError(error: HttpErrorResponse): void {
    if (this.apiError.isUnauthorized(error)) {
      this.profileState.setError('Sessão expirada. Por favor, faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }

    this.profileState.setError(this.apiError.message(error, {
      conflict: 'Este email já está em uso. Por favor, escolha outro.',
      fallback: 'Erro ao atualizar perfil. Tente novamente.'
    }));
    this.logger.error('Update profile error:', error);
  }
}

