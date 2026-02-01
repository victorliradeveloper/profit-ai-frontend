import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { getServerMessage } from '../../shared/profile-http.utils';
import { ProfileSessionService } from '../../shared/profile-session.service';

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

  private readonly MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  private readonly PROFILE_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

  private profileImagePreviewObjectUrl?: string;
  private profileImageMessageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private profileSession: ProfileSessionService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userAvatarUrl = this.authService.getUserAvatarUrl();
  }

  ngOnDestroy(): void {
    this.clearProfileImageMessageTimeout();
    this.revokeProfileImagePreviewObjectUrl();
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

    this.authService.updateProfileImage(this.selectedProfileImageFile).pipe(
      finalize(() => {
        this.isUploadingProfileImage = false;
      })
    ).subscribe({
      next: (response: any) => {
        const url = response?.avatarUrl || response?.imageUrl || response?.photoUrl;
        if (url) {
          this.userAvatarUrl = url;
          this.selectedProfileImageFile = null;
          this.profileImagePreviewUrl = null;
          this.revokeProfileImagePreviewObjectUrl();
          this.showProfileImageSuccessMessage(response?.message || 'Foto de perfil atualizada!');
          return;
        }

        // Se o backend não retornar URL, mantemos o preview para não “quebrar” a imagem (objectURL não é revogado aqui).
        if (this.profileImagePreviewUrl) {
          this.userAvatarUrl = this.profileImagePreviewUrl;
        }
        this.selectedProfileImageFile = null;
        this.showProfileImageSuccessMessage(response?.message || 'Foto de perfil atualizada!');
      },
      error: (error: any) => {
        if (error?.status === 401 || error?.status === 403) {
          this.showProfileImageErrorMessage('Sessão expirada. Por favor, faça login novamente.');
          this.profileSession.scheduleLogoutToLogin();
          return;
        }

        if (error?.status === 400) {
          const serverMessage = getServerMessage(error);
          this.showProfileImageErrorMessage(serverMessage || 'Imagem inválida. Verifique o arquivo.');
          return;
        }

        if (error?.status === 0 || error?.status >= 500) {
          this.showProfileImageErrorMessage('Erro no servidor. Tente novamente mais tarde.');
          return;
        }

        this.showProfileImageErrorMessage('Erro ao enviar foto. Tente novamente.');
        console.error('Upload profile image error:', error);
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

