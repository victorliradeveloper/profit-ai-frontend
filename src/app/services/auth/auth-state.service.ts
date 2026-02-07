import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private readonly STORAGE_KEYS = {
    TOKEN: 'token',
    USER_NAME: 'userName',
    USER_EMAIL: 'userEmail',
    USER_AVATAR_KEY: 'userAvatarKey',
    USER_AVATAR_URL: 'userAvatarUrl'
  } as const;

  private readonly sessionSubject = new BehaviorSubject<AuthSession>(this.readFromStorage());
  readonly session$ = this.sessionSubject.asObservable();

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
      token: localStorage.getItem(this.STORAGE_KEYS.TOKEN),
      userName: localStorage.getItem(this.STORAGE_KEYS.USER_NAME),
      userEmail: localStorage.getItem(this.STORAGE_KEYS.USER_EMAIL),
      userAvatarKey:
        localStorage.getItem(this.STORAGE_KEYS.USER_AVATAR_KEY) ||
        localStorage.getItem(this.STORAGE_KEYS.USER_AVATAR_URL)
    };
  }
}

