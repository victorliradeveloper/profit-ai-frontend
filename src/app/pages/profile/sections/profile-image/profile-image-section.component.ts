import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';

import { AuthService } from '../../../../services/auth/auth.service';
import type { AuthProfileResponse } from '../../../../services/auth/auth.types';
import { ApiErrorService } from '../../../../services/http/api-error.service';
import { FileTransferService } from '../../../../services/files/file-transfer.service';
import { LoggerService } from '../../../../services/logger/logger.service';

const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const PROFILE_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const SUCCESS_MESSAGE_DURATION = 3000;

type AllowedImageType = (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number];

@Component({
  selector: 'app-profile-image-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-image-section.component.html',
})
export class ProfileImageSectionComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fileTransfer = inject(FileTransferService);
  private readonly logger = inject(LoggerService);
  private readonly apiError = inject(ApiErrorService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userProfile = signal<{
    name: string;
    email: string;
    avatarKey: string | null;
  } | null>(null);

  /** Object URLs for preview / persisted avatar (signals so computeds stay in sync). */
  private readonly previewObjectUrl = signal<string | null>(null);
  private readonly persistedAvatarObjectUrl = signal<string | null>(null);

  isUploadingProfileImage = false;
  selectedProfileImageFile: File | null = null;

  profileImageErrorMessage = '';
  profileImageSuccessMessage = '';

  private profileImageMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly profileImagePreviewUrl = computed(() => this.previewObjectUrl());
  readonly userAvatarUrl = computed(() => this.persistedAvatarObjectUrl());
  readonly displayedAvatarUrl = computed(
    () => this.profileImagePreviewUrl() || this.userAvatarUrl(),
  );

  readonly profileInitials = computed(() => {
    const profile = this.userProfile();
    const name = profile?.name?.trim() || '';
    if (!name) return 'U';

    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    const initials = (first + last).toUpperCase();
    return initials || 'U';
  });

  get userName(): string {
    return this.userProfile()?.name ?? '';
  }

  get userEmail(): string {
    return this.userProfile()?.email ?? '';
  }

  public ngOnInit(): void {
    this.loadUserProfile();
  }

  public onSelectProfileImage(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0] ?? null;
    if (!file) return;
    this.validateAndSetImage(file);
  }

  public cancelProfileImageSelection(fileInput?: HTMLInputElement): void {
    this.selectedProfileImageFile = null;
    this.revokePreviewUrl();
    this.clearMessages();
    fileInput?.setAttribute('value', '');
  }

  public uploadProfileImage(): void {
    if (!this.selectedProfileImageFile) {
      this.showError('Selecione uma imagem para enviar.');
      return;
    }
    this.executeUpload();
  }

  private loadUserProfile(): void {
    this.authService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile: AuthProfileResponse) => {
          this.userProfile.set({
            name: profile.name || '',
            email: profile.email || '',
            avatarKey: profile.avatarKey ?? null,
          });
          this.loadPersistedAvatar();
        },
        error: () => this.loadPersistedAvatar(),
      });
  }

  private loadPersistedAvatar(): void {
    const avatarKey = this.authService.getUserAvatarKey();
    if (!avatarKey) {
      this.revokeUserAvatarUrl();
      return;
    }

    this.fileTransfer
      .downloadByKey(avatarKey)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.revokeUserAvatarUrl();
          this.persistedAvatarObjectUrl.set(URL.createObjectURL(blob));
        },
        error: () => this.revokeUserAvatarUrl(),
      });
  }

  private validateAndSetImage(file: File): void {
    this.clearMessages();

    if (!PROFILE_IMAGE_ALLOWED_TYPES.includes(file.type as AllowedImageType)) {
      this.showError('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      this.showError('Imagem muito grande. Máximo: 2MB.');
      return;
    }

    this.selectedProfileImageFile = file;
    this.revokePreviewUrl();
    this.previewObjectUrl.set(URL.createObjectURL(file));
    this.clearInputValue();

    this.executeUpload();
  }

  private executeUpload(): void {
    const file = this.selectedProfileImageFile;
    if (!file) return;

    this.isUploadingProfileImage = true;
    this.clearMessages();

    this.fileTransfer
      .uploadAvatar(file)
      .pipe(
        switchMap((res) => this.authService.updateAvatarKey(res.key)),
        finalize(() => {
          this.isUploadingProfileImage = false;
          this.selectedProfileImageFile = null;
          this.revokePreviewUrl();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (profile: AuthProfileResponse) => {
          this.authService.setUserAvatarKey(profile.avatarKey ?? null);
          this.loadPersistedAvatar();
          this.showSuccess('Foto de perfil atualizada!');
        },
        error: (error: HttpErrorResponse) => {
          this.showError(
            this.apiError.message(error, {
              fallback: 'Erro ao enviar foto. Tente novamente.',
            }),
          );
          this.logger.error('Upload profile image error:', error);
        },
      });
  }

  private clearInputValue(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.setAttribute('value', '');
  }

  private clearMessages(): void {
    this.profileImageErrorMessage = '';
    this.profileImageSuccessMessage = '';
    this.clearMessageTimeout();
  }

  private clearMessageTimeout(): void {
    if (this.profileImageMessageTimeout) {
      clearTimeout(this.profileImageMessageTimeout);
      this.profileImageMessageTimeout = null;
    }
  }

  private showSuccess(message: string): void {
    this.profileImageSuccessMessage = message;
    this.profileImageErrorMessage = '';
    this.setMessageTimeout();
  }

  private showError(message: string): void {
    this.profileImageErrorMessage = message;
    this.profileImageSuccessMessage = '';
    this.clearMessageTimeout();
  }

  private setMessageTimeout(): void {
    this.clearMessageTimeout();
    this.profileImageMessageTimeout = setTimeout(() => {
      this.profileImageSuccessMessage = '';
    }, SUCCESS_MESSAGE_DURATION);
  }

  private revokePreviewUrl(): void {
    const url = this.previewObjectUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewObjectUrl.set(null);
  }

  private revokeUserAvatarUrl(): void {
    const url = this.persistedAvatarObjectUrl();
    if (url) URL.revokeObjectURL(url);
    this.persistedAvatarObjectUrl.set(null);
  }
}
