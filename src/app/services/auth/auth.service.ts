import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isNonEmptyString } from '../utils/string.utils';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AuthProfileResponse
} from './auth.types';
import { LoggerService } from '../logger/logger.service';
import { AuthStateService } from './auth-state.service';
import { SessionStorageService } from '../storage/session-storage.service';
import { AUTH_STORAGE_KEYS, AUTH_STORAGE_KEY_LIST } from './auth.storage';
import { apiUrl } from '../http/api-url';
import { API_PATHS } from '../http/api-paths';

interface UserData {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly basePaths = {
    login: apiUrl(API_PATHS.auth.login),
    register: apiUrl(API_PATHS.auth.register),
    profile: apiUrl(API_PATHS.auth.profile),
    avatar: apiUrl(API_PATHS.auth.avatar),
    password: apiUrl(API_PATHS.auth.password),
  };

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private authState: AuthStateService,
    private storage: SessionStorageService
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.basePaths.login, credentials)
      .pipe(
        this.handleAuthSuccess('login', credentials.email),
        this.handleHttpError('login')
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.basePaths.register, userData)
      .pipe(
        this.handleAuthSuccess('register', userData.email),
        this.handleHttpError('register')
      );
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    this.guardAuthenticated();
    
    return this.http.put<UpdateProfileResponse>(this.basePaths.profile, profileData)
      .pipe(
        this.handleProfileUpdate(profileData),
        this.handleHttpError('updateProfile')
      );
  }

  getProfile(): Observable<AuthProfileResponse> {
    this.guardAuthenticated();
    
    return this.http.get<AuthProfileResponse>(this.basePaths.profile)
      .pipe(
        this.handleProfileSync(),
        this.handleHttpError('getProfile')
      );
  }

  updateAvatarKey(avatarKey: string): Observable<AuthProfileResponse> {
    this.guardAuthenticated();
    
    return this.http.put<AuthProfileResponse>(this.basePaths.avatar, { avatarKey })
      .pipe(
        this.handleAvatarUpdate(),
        this.handleHttpError('updateAvatarKey')
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    this.guardAuthenticated();
    
    return this.http.put<ChangePasswordResponse>(this.basePaths.password, passwordData)
      .pipe(this.handleHttpError('changePassword'));
  }

  logout(): void {
    this.storage.clear(AUTH_STORAGE_KEY_LIST);
    this.authState.clear();
    this.logger.info('User logged out successfully');
  }

  isAuthenticated(): boolean {
    return isNonEmptyString(this.getToken());
  }

  getToken(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.TOKEN);
  }

  getUserName(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.USER_NAME);
  }

  getUserEmail(): string | null {
    return this.storage.get(AUTH_STORAGE_KEYS.USER_EMAIL);
  }

  getUserAvatarKey(): string | null {
    const avatarKey = this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
    
    if (isNonEmptyString(avatarKey)) {
      return avatarKey;
    }

    // Legacy migration
    const legacyAvatarUrl = this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_URL);
    if (isNonEmptyString(legacyAvatarUrl) && this.isLegacyAvatarKey(legacyAvatarUrl)) {
      this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, legacyAvatarUrl);
      return legacyAvatarUrl;
    }

    return null;
  }

  setUserAvatarKey(avatarKey: string | null): void {
    if (!avatarKey) {
      this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
    } else {
      this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, avatarKey);
    }
    
    this.authState.syncFromStorage();
  }

  private handleAuthSuccess(operation: string, email: string): OperatorFunction<LoginResponse, LoginResponse> {
    return tap(response => {
      if (isNonEmptyString(response.token) && isNonEmptyString(response.name)) {
        this.saveUserData({ name: response.name, email }, response.token);
        this.authState.syncFromStorage();
        this.logger.info(`${operation} successful`);
      }
    });
  }

  private handleProfileUpdate(profileData: UpdateProfileRequest): OperatorFunction<UpdateProfileResponse, UpdateProfileResponse> {
    return tap(response => {
      const updatedData = response || profileData;
      this.syncUserData(updatedData);
      this.authState.syncFromStorage();
      this.logger.info('Profile updated successfully');
    });
  }

  private handleProfileSync(): OperatorFunction<AuthProfileResponse, AuthProfileResponse> {
    return tap(profile => {
      this.syncUserData(profile);
      this.authState.syncFromStorage();
      this.logger.debug('Profile synced from server');
    });
  }

  private handleAvatarUpdate(): OperatorFunction<AuthProfileResponse, AuthProfileResponse> {
    return tap(profile => {
      this.syncAvatarKey(profile.avatarKey);
      this.authState.syncFromStorage();
      this.logger.info('Avatar updated successfully');
    });
  }

  private handleHttpError<T>(operation: string): OperatorFunction<T, T> {
    return catchError((error: unknown) => {
      this.logger.error(`[${operation}] HTTP error:`, error);
      return throwError(() => error);
    }) as OperatorFunction<T, T>;
  }

  private saveUserData(userData: UserData, token?: string): void {
    if (token) {
      this.storage.set(AUTH_STORAGE_KEYS.TOKEN, token);
    }
    
    this.storage.set(AUTH_STORAGE_KEYS.USER_NAME, userData.name);
    this.storage.set(AUTH_STORAGE_KEYS.USER_EMAIL, userData.email);
  }

  private syncUserData(data: Partial<{ name: string; email: string; avatarKey: string | null }>): void {
    const name = data.name;
    if (isNonEmptyString(name) && name !== this.getUserName()) {
      this.storage.set(AUTH_STORAGE_KEYS.USER_NAME, name);
    }

    const email = data.email;
    if (isNonEmptyString(email) && email !== this.getUserEmail()) {
      this.storage.set(AUTH_STORAGE_KEYS.USER_EMAIL, email);
    }

    this.syncAvatarKey(data.avatarKey);
  }

  private syncAvatarKey(avatarKey: string | null | undefined): void {
    if (isNonEmptyString(avatarKey)) {
      this.storage.set(AUTH_STORAGE_KEYS.USER_AVATAR_KEY, avatarKey);
    } else {
      this.storage.remove(AUTH_STORAGE_KEYS.USER_AVATAR_KEY);
    }
  }

  private guardAuthenticated(): asserts this is { isAuthenticated: () => true } {
    if (!this.isAuthenticated()) {
      this.logger.warn('Attempted authenticated operation without valid token');
      throw new Error('User is not authenticated');
    }
  }

  private isLegacyAvatarKey(avatarUrl: string | null): boolean {
    return !!avatarUrl && !/^https?:\/\//i.test(avatarUrl) && !avatarUrl.includes('/');
  }
}