import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, UpdateProfileResponse, ChangePasswordRequest, ChangePasswordResponse, AuthProfileResponse } from './auth.types';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../logger/logger.service';
import { AuthStateService } from './auth-state.service';
import { SessionStorageService } from '../storage/session-storage.service';
import { AUTH_STORAGE_KEYS, AUTH_STORAGE_KEY_LIST } from './auth.storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/v1/auth`;

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private authState: AuthStateService,
    private storage: SessionStorageService
  ) {}

  private handleHttpError(operation: string) {
    return (error: HttpErrorResponse) => {
      this.logger.error(`${operation} error in service:`, error);
      return throwError(() => error);
    };
  }

  private saveUserData(name: string, email: string, token?: string): void {
    if (token) {
      this.storage.set(AUTH_STORAGE_KEYS.TOKEN, token);
    }
    this.storage.set(AUTH_STORAGE_KEYS.USER_NAME, name);
    this.storage.set(AUTH_STORAGE_KEYS.USER_EMAIL, email);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      credentials
    ).pipe(
      tap(response => {
        if (response.token && response.name) {
          this.saveUserData(response.name, credentials.email, response.token);
          this.authState.syncFromStorage();
        }
      }),
      catchError(this.handleHttpError('Login'))
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`, 
      userData
    ).pipe(
      tap(response => {
        if (response.token && response.name) {
          this.saveUserData(response.name, userData.email, response.token);
          this.authState.syncFromStorage();
        }
      }),
      catchError(this.handleHttpError('Register'))
    );
  }

  logout(): void {
    this.storage.clear(AUTH_STORAGE_KEY_LIST);
    this.authState.clear();
  }

  getUserEmail(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.USER_EMAIL);
  }

  getUserAvatarKey(): string | null {
    const key = this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
    if (key) return key;

    // Compat: versões antigas podem ter salvo no userAvatarUrl
    const legacy = this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_URL);
    if (legacy && !/^https?:\/\//i.test(legacy) && !legacy.includes('/')) {
      this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, legacy);
      return legacy;
    }
    return null;
  }

  setUserAvatarKey(value: string | null): void {
    if (!value) {
      this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
      this.authState.syncFromStorage();
      return;
    }
    this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, value);
    this.authState.syncFromStorage();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.TOKEN);
  }

  getUserName(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.USER_NAME);
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.put<UpdateProfileResponse>(
      `${this.apiUrl}/profile`, 
      profileData
    ).pipe(
      tap(response => {
        const updatedData = response || profileData;
        const currentName = this.getUserName();
        const currentEmail = this.getUserEmail();
        
        if (updatedData.name && updatedData.name !== currentName) {
          this.storage.set(AUTH_STORAGE_KEYS.USER_NAME, updatedData.name);
        }
        if (updatedData.email && updatedData.email !== currentEmail) {
          this.storage.set(AUTH_STORAGE_KEYS.USER_EMAIL, updatedData.email);
        }
        if (typeof updatedData.avatarKey !== 'undefined') {
          if (updatedData.avatarKey) {
            this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, updatedData.avatarKey);
          } else {
            this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
          }
        }

        this.authState.syncFromStorage();
      }),
      catchError(this.handleHttpError('Update profile'))
    );
  }

  getProfile(): Observable<AuthProfileResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.get<AuthProfileResponse>(
      `${this.apiUrl}/profile`
    ).pipe(
      tap(profile => {
        this.storage.set(AUTH_STORAGE_KEYS.USER_NAME, profile.name);
        this.storage.set(AUTH_STORAGE_KEYS.USER_EMAIL, profile.email);
        if (profile.avatarKey) {
          this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, profile.avatarKey);
        } else {
          this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
        }
        this.authState.syncFromStorage();
      }),
      catchError(this.handleHttpError('Get profile'))
    );
  }

  updateAvatarKey(avatarKey: string): Observable<AuthProfileResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.put<AuthProfileResponse>(
      `${this.apiUrl}/profile/avatar`,
      { avatarKey }
    ).pipe(
      tap(profile => {
        if (profile.avatarKey) {
          this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, profile.avatarKey);
        } else {
          this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
        }
        this.authState.syncFromStorage();
      }),
      catchError(this.handleHttpError('Update avatar'))
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return this.http.put<ChangePasswordResponse>(
      `${this.apiUrl}/password`,
      passwordData
    ).pipe(
      catchError(this.handleHttpError('Change password'))
    );
  }
}

