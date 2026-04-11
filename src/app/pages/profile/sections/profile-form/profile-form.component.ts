import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import type { UpdateProfileResponse } from '../../../../services/auth/auth.types';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ProfileSessionService } from '../../../../services/profile/profile-session.service';
import { ProfileStateService } from '../../../../services/profile/profile-state.service';
import {
  profileEmailFieldMessages,
  profileInvalidFormSummaryMessage,
  profileNameFieldMessages,
} from './profile-form-messages';
import type { ProfileFormControls, ProfileFormData } from './profile-form.types';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent implements OnInit {
  // --- Constants ---
  private readonly MIN_NAME_LENGTH = 2;

  // --- Injected services ---
  private readonly authService = inject(AuthService);
  private readonly profileSession = inject(ProfileSessionService);
  private readonly profileState = inject(ProfileStateService);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // --- UI state ---
  private readonly userProfile = signal<ProfileFormData | null>(null);
  isEditing = false;
  submitAttempted = false;
  readonly isLoading = signal(false);

  // --- Form + reactive bridge (computed does not track FormControl values) ---
  readonly form = this.createForm();

  private readonly formValidityTick = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(
      map(() => undefined),
      startWith(undefined),
    ),
    { initialValue: undefined },
  );

  // --- Computed ---
  readonly hasChanges = computed(() => {
    this.formValidityTick();
    const formValue = this.form.getRawValue();
    const profile = this.userProfile();
    if (!profile) return false;
    return (
      formValue.name.trim() !== profile.name || formValue.email.trim() !== profile.email
    );
  });

  readonly canSave = computed(() => {
    this.formValidityTick();
    return this.form.valid && this.hasChanges() && !this.isLoading();
  });

  readonly nameControl = this.form.controls.name;
  readonly emailControl = this.form.controls.email;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // --- Public API ---
  startEditing(): void {
    this.isEditing = true;
    this.resetForm();
    this.profileState.clear();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetForm();
    this.profileState.clear();
  }

  saveProfile(): void {
    this.submitAttempted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.profileState.setError(
        profileInvalidFormSummaryMessage(this.MIN_NAME_LENGTH, this.nameControl, this.emailControl),
      );
      return;
    }

    if (!this.hasChanges()) {
      this.profileState.setError('Nenhuma alteração foi feita');
      return;
    }

    this.executeSave();
  }

  logout(): void {
    this.profileSession.logoutToLogin();
  }

  // --- Template helpers ---
  get nameError(): string | null {
    return this.fieldError(this.nameControl, profileNameFieldMessages(this.MIN_NAME_LENGTH));
  }

  get emailError(): string | null {
    return this.fieldError(this.emailControl, profileEmailFieldMessages());
  }

  get userName(): string {
    return this.userProfile()?.name ?? '';
  }

  get userEmail(): string {
    return this.userProfile()?.email ?? '';
  }

  // --- Form factory ---
  private createForm(): FormGroup<ProfileFormControls> {
    return this.fb.group({
      name: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(this.MIN_NAME_LENGTH),
      ]),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    });
  }

  // --- Load / reset ---
  private loadUserProfile(): void {
    const profile: ProfileFormData = {
      name: this.authService.getUserName() || '',
      email: this.authService.getUserEmail() || '',
    };
    this.userProfile.set(profile);
    this.resetForm();
  }

  private resetForm(): void {
    const profile = this.userProfile();
    if (profile) {
      this.form.reset(profile, { emitEvent: false });
    }
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitAttempted = false;
  }

  // --- Save flow ---
  private executeSave(): void {
    const formValue = this.form.getRawValue();
    const profileData: ProfileFormData = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
    };

    this.isLoading.set(true);
    this.profileState.clear();

    this.authService
      .updateProfile(profileData)
      .pipe(finalize(() => this.isLoading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: UpdateProfileResponse) => {
          this.userProfile.set({
            name: response.name || profileData.name,
            email: response.email || profileData.email,
          });
          this.isEditing = false;
          this.resetForm();
          this.profileState.setSuccess('Perfil atualizado com sucesso!');
        },
        error: (error: HttpErrorResponse) => this.handleUpdateError(error),
      });
  }

  private handleUpdateError(error: HttpErrorResponse): void {
    if (this.apiError.isUnauthorized(error)) {
      this.profileState.setError('Sessão expirada. Faça login novamente.');
      this.profileSession.scheduleLogoutToLogin();
      return;
    }

    this.profileState.setError(
      this.apiError.message(error, {
        conflict: 'Este email já está em uso.',
        fallback: 'Erro ao atualizar perfil. Tente novamente.',
      }),
    );

    this.logger.error('Update profile error:', error);
  }

  // --- Field errors ---
  private fieldError(control: AbstractControl, messages: Record<string, string>): string | null {
    if (!control.invalid || !this.shouldShowFieldError(control)) return null;
    for (const [key, message] of Object.entries(messages)) {
      if (control.hasError(key)) return message;
    }
    return null;
  }

  private shouldShowFieldError(control: AbstractControl): boolean {
    return this.submitAttempted || control.touched;
  }
}
