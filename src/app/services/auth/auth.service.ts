import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, UpdateProfileRequest, UpdateProfileResponse, ChangePasswordRequest, ChangePasswordResponse, AuthProfileResponse } from './auth.types';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../logger/logger.service';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/v1/auth`;
  private readonly STORAGE_KEYS = {
    TOKEN: 'token',
    USER_NAME: 'userName',
    USER_EMAIL: 'userEmail',
    USER_AVATAR_KEY: 'userAvatarKey',
    USER_AVATAR_URL: 'userAvatarUrl'
  } as const;

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private authState: AuthStateService
  ) {}

  private handleHttpError(operation: string) {
    return (error: unknown) => {
      this.logger.error(`${operation} error in service:`, error);
      return throwError(() => error);
    };
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

  register(userData: { email: string; password: string; name: string }): Observable<LoginResponse> {
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
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.authState.clear();
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USER_EMAIL);
  }

  getUserAvatarKey(): string | null {
    const key = localStorage.getItem(this.STORAGE_KEYS.USER_AVATAR_KEY);
    if (key) return key;

    // Compat: versões antigas podem ter salvo no userAvatarUrl
    const legacy = localStorage.getItem(this.STORAGE_KEYS.USER_AVATAR_URL);
    if (legacy && !/^https?:\/\//i.test(legacy) && !legacy.includes('/')) {
      localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_KEY, legacy);
      return legacy;
    }
    return null;
  }

  setUserAvatarKey(value: string | null): void {
    if (!value) {
      localStorage.removeItem(this.STORAGE_KEYS.USER_AVATAR_KEY);
      this.authState.syncFromStorage();
      return;
    }
    localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_KEY, value);
    this.authState.syncFromStorage();
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
      profileData
    ).pipe(
      tap(response => {
        const updatedData = response || profileData;
        const currentName = this.getUserName();
        const currentEmail = this.getUserEmail();
        
        if (updatedData.name && updatedData.name !== currentName) {
          localStorage.setItem(this.STORAGE_KEYS.USER_NAME, updatedData.name);
        }
        if (updatedData.email && updatedData.email !== currentEmail) {
          localStorage.setItem(this.STORAGE_KEYS.USER_EMAIL, updatedData.email);
        }
        if (typeof updatedData.avatarKey !== 'undefined') {
          if (updatedData.avatarKey) {
            localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_KEY, updatedData.avatarKey);
          } else {
            localStorage.removeItem(this.STORAGE_KEYS.USER_AVATAR_KEY);
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
        localStorage.setItem(this.STORAGE_KEYS.USER_NAME, profile.name);
        localStorage.setItem(this.STORAGE_KEYS.USER_EMAIL, profile.email);
        if (profile.avatarKey) {
          localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_KEY, profile.avatarKey);
        } else {
          localStorage.removeItem(this.STORAGE_KEYS.USER_AVATAR_KEY);
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
          localStorage.setItem(this.STORAGE_KEYS.USER_AVATAR_KEY, profile.avatarKey);
        } else {
          localStorage.removeItem(this.STORAGE_KEYS.USER_AVATAR_KEY);
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

