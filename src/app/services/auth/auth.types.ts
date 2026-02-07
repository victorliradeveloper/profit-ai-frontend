export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  id?: string;
  name?: string;
  email?: string;
  avatarKey?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message?: string;
}

export interface AuthProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarKey: string | null;
}
