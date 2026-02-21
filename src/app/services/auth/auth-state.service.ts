import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SessionStorageService } from '../storage/session-storage.service';
import { AUTH_STORAGE_KEYS } from './auth.storage';

export type AuthSession = {
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatarKey: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly sessionSubject: BehaviorSubject<AuthSession>;
  readonly session$;
  readonly isAuthenticated$;

  constructor(private storage: SessionStorageService) {
    this.sessionSubject = new BehaviorSubject<AuthSession>(this.readFromStorage());
    this.session$ = this.sessionSubject.asObservable();
    this.isAuthenticated$ = this.session$.pipe(
      map((s) => !!s.token),
      distinctUntilChanged(),
    );
  }

  get snapshot(): AuthSession {
    return this.sessionSubject.value;
  }

  syncFromStorage(): void {
    this.sessionSubject.next(this.readFromStorage());
  }

  clear(): void {
    this.sessionSubject.next({
      token: null,
      userName: null,
      userEmail: null,
      userAvatarKey: null
    });
  }

  private readFromStorage(): AuthSession {
    return {
      token: this.storage.get(AUTH_STORAGE_KEYS.TOKEN),
      userName: this.storage.get(AUTH_STORAGE_KEYS.USER_NAME),
      userEmail: this.storage.get(AUTH_STORAGE_KEYS.USER_EMAIL),
      userAvatarKey:
        this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_KEY) || this.storage.get(AUTH_STORAGE_KEYS.USER_AVATAR_URL)
    };
  }
}

