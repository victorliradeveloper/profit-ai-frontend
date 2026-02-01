export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  token: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message?: string;
}

export interface UpdateProfileImageResponse {
  avatarUrl?: string;
  imageUrl?: string;
  photoUrl?: string;
  message?: string;
}