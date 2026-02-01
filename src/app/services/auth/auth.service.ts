import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, UpdateProfileRequest, UpdateProfileResponse, ChangePasswordRequest, ChangePasswordResponse, UpdateProfileImageResponse } from './auth.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/v1/auth`;
  private readonly STORAGE_KEYS = {
    TOKEN: 'token',
    USER_NAME: 'userName',
    USER_EMAIL: 'userEmail',
    USER_AVATAR_URL: 'userAvatarUrl'
  } as const;

  constructor(private http: HttpClient) {}

  private handleHttpError(operation: string) {
    return (error: unknown) => {
      console.error(`${operation} error in service:`, error);
      return throwError(() => error);
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    // Não setar Content-Type: o browser precisa definir o boundary do multipart/form-data
    const token = this.getToken();
    return new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private saveUserData(name: string, email: string, token?: string): void {
    if (token) {
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
    }
    localStorage.setItem(this.STORAGE_KEYS.USER_NAME, name);
    localStorage.setItem(this.STORAGE_KEYS.USER_EMAIL, email);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      credentials, 
      { headers: this.getDefaultHeaders() }
    ).pipe(
      tap(response => {
        if (response.token && response.name) {
          this.saveUserData(response.name, credentials.email, response.token);
          if (response.avatarUrl) {
            localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_URL, response.avatarUrl);
          }
        }
      }),
      catchError(this.handleHttpError('Login'))
    );
  }

  register(userData: { email: string; password: string; name: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`, 
      userData, 
      { headers: this.getDefaultHeaders() }
    ).pipe(
      tap(response => {
        if (response.token && response.name) {
          this.saveUserData(response.name, userData.email, response.token);
          if (response.avatarUrl) {
            localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_URL, response.avatarUrl);
          }
        }
      }),
      catchError(this.handleHttpError('Register'))
    );
  }

  logout(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USER_EMAIL);
  }

  getUserAvatarUrl(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USER_AVATAR_URL);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USER_NAME);
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.put<UpdateProfileResponse>(
      `${this.apiUrl}/profile`, 
      profileData, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        // Atualizar localStorage com a resposta do servidor ou com os dados enviados
        const updatedData = response || profileData;
        const currentName = this.getUserName();
        const currentEmail = this.getUserEmail();
        
        if (updatedData.name && updatedData.name !== currentName) {
          localStorage.setItem(this.STORAGE_KEYS.USER_NAME, updatedData.name);
        }
        if (updatedData.email && updatedData.email !== currentEmail) {
          localStorage.setItem(this.STORAGE_KEYS.USER_EMAIL, updatedData.email);
        }
        if (updatedData.avatarUrl) {
          localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_URL, updatedData.avatarUrl);
        }
      }),
      catchError(this.handleHttpError('Update profile'))
    );
  }

  updateProfileImage(file: File): Observable<UpdateProfileImageResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    const formData = new FormData();
    // Backend comum: espera "file" ou "image". Usando "file" como padrão.
    formData.append('file', file);

    return this.http.put<UpdateProfileImageResponse>(
      `${this.apiUrl}/profile/image`,
      formData,
      { headers: this.getAuthHeadersForFormData() }
    ).pipe(
      tap(response => {
        const url = response?.avatarUrl || response?.imageUrl || response?.photoUrl;
        if (url) {
          localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_URL, url);
        }
      }),
      catchError(this.handleHttpError('Update profile image'))
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.put<ChangePasswordResponse>(
      `${this.apiUrl}/password`,
      passwordData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleHttpError('Change password'))
    );
  }
}

