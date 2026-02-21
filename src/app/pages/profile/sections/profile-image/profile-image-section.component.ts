import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../services/auth/auth.service';
import { FileTransferService } from '../../../../services/files/file-transfer.service';
import { LoggerService } from '../../../../services/logger/logger.service';
import { ApiErrorService } from '../../../../services/http/api-error.service';

@Component({
  selector: 'app-profile-image-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-image-section.component.html'
})
export class ProfileImageSectionComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userAvatarUrl: string | null = null;

  profileImagePreviewUrl: string | null = null;
  selectedProfileImageFile: File | null = null;
  isUploadingProfileImage: boolean = false;
  profileImageErrorMessage: string = '';
  profileImageSuccessMessage: string = '';

  private readonly MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
  private readonly PROFILE_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

  private profileImagePreviewObjectUrl?: string;
  private userAvatarObjectUrl?: string;
  private profileImageMessageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private fileTransfer: FileTransferService,
    private logger: LoggerService,
    private apiError: ApiErrorService,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.name;
        this.loadPersistedAvatar();
      },
      error: () => {
        this.loadPersistedAvatar();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearProfileImageMessageTimeout();
    this.revokeProfileImagePreviewObjectUrl();
    this.revokeUserAvatarObjectUrl();
  }
  private revokeUserAvatarObjectUrl(): void {
    if (this.userAvatarObjectUrl) {
      URL.revokeObjectURL(this.userAvatarObjectUrl);
      this.userAvatarObjectUrl = undefined;
    }
  }

  private loadPersistedAvatar(): void {
    const avatarKey = this.authService.getUserAvatarKey();
    if (!avatarKey) {
      this.userAvatarUrl = null;
      return;
    }

    this.fileTransfer.downloadByKey(avatarKey).subscribe({
      next: (blob) => {
        this.revokeUserAvatarObjectUrl();
        this.userAvatarObjectUrl = URL.createObjectURL(blob);
        this.userAvatarUrl = this.userAvatarObjectUrl;
      },
      error: () => {
        this.userAvatarUrl = null;
      }
    });
  }


  get profileInitials(): string {
    const name = (this.userName || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
    return (first + last).toUpperCase() || 'U';
  }

  get displayedAvatarUrl(): string | null {
    return this.profileImagePreviewUrl || this.userAvatarUrl;
  }

  onSelectProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    this.clearProfileImageMessages();
    if (!file) return;

    if (!this.PROFILE_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof this.PROFILE_IMAGE_ALLOWED_TYPES)[number])) {
      this.showProfileImageErrorMessage('Formato inválido. Use PNG, JPG ou WEBP.');
      if (input) input.value = '';
      return;
    }

    if (file.size > this.MAX_PROFILE_IMAGE_SIZE_BYTES) {
      this.showProfileImageErrorMessage('Imagem muito grande. Tamanho máximo: 2MB.');
      if (input) input.value = '';
      return;
    }

    this.selectedProfileImageFile = file;
    this.revokeProfileImagePreviewObjectUrl();
    this.profileImagePreviewObjectUrl = URL.createObjectURL(file);
    this.profileImagePreviewUrl = this.profileImagePreviewObjectUrl;
  }

  cancelProfileImageSelection(fileInput?: HTMLInputElement): void {
    this.selectedProfileImageFile = null;
    this.profileImagePreviewUrl = null;
    this.revokeProfileImagePreviewObjectUrl();
    this.clearProfileImageMessages();
    if (fileInput) fileInput.value = '';
  }

  uploadProfileImage(): void {
    if (!this.selectedProfileImageFile) {
      this.showProfileImageErrorMessage('Selecione uma imagem para enviar.');
      return;
    }

    this.isUploadingProfileImage = true;
    this.clearProfileImageMessages();

    const file = this.selectedProfileImageFile;
    this.fileTransfer.uploadAvatar(file).pipe(
      switchMap((res) => this.authService.updateAvatarKey(res.key)),
      finalize(() => {
        this.isUploadingProfileImage = false;
      })
    ).subscribe({
      next: (profile) => {
        this.authService.setUserAvatarKey(profile.avatarKey || null);
        this.loadPersistedAvatar();

        this.selectedProfileImageFile = null;
        this.profileImagePreviewUrl = null;
        this.revokeProfileImagePreviewObjectUrl();
        this.showProfileImageSuccessMessage('Foto de perfil atualizada!');
      },
      error: (error: HttpErrorResponse) => {
        this.showProfileImageErrorMessage(this.apiError.message(error, {
          fallback: 'Erro ao enviar foto. Tente novamente.'
        }));
        this.logger.error('Upload profile image error:', error);
      }
    });
  }

  private clearProfileImageMessages(): void {
    this.profileImageErrorMessage = '';
    this.profileImageSuccessMessage = '';
    this.clearProfileImageMessageTimeout();
  }

  private clearProfileImageMessageTimeout(): void {
    if (this.profileImageMessageTimeout) {
      clearTimeout(this.profileImageMessageTimeout);
      this.profileImageMessageTimeout = undefined;
    }
  }

  private showProfileImageSuccessMessage(message: string, duration: number = 3000): void {
    this.profileImageSuccessMessage = message;
    this.profileImageErrorMessage = '';
    this.clearProfileImageMessageTimeout();
    this.profileImageMessageTimeout = setTimeout(() => {
      this.profileImageSuccessMessage = '';
    }, duration);
  }

  private showProfileImageErrorMessage(message: string): void {
    this.profileImageErrorMessage = message;
    this.profileImageSuccessMessage = '';
    this.clearProfileImageMessageTimeout();
  }

  private revokeProfileImagePreviewObjectUrl(): void {
    if (this.profileImagePreviewObjectUrl) {
      URL.revokeObjectURL(this.profileImagePreviewObjectUrl);
      this.profileImagePreviewObjectUrl = undefined;
    }
  }
}

