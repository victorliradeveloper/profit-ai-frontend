import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, of } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { AuthService } from "../../services/auth/auth.service";
import { AuthStateService } from "../../services/auth/auth-state.service";
import { FileTransferService } from "../../services/files/file-transfer.service";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule, MatMenuModule, MatIconModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | null = null;
  userAvatarUrl: string | null = null;
  private readonly destroy$ = new Subject<void>();
  private userAvatarObjectUrl?: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService,
    private fileTransfer: FileTransferService
  ) {}

  ngOnInit() {
    this.authState.session$.pipe(
      takeUntil(this.destroy$),
      tap((session) => {
        this.isAuthenticated = !!session.token;
        this.userName = session.userName;
      }),
      map((session) => (session.token ? session.userAvatarKey : null)),
      distinctUntilChanged(),
      switchMap((avatarKey) => {
        if (!avatarKey) return of(null);
        return this.fileTransfer.downloadByKey(avatarKey).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe((blob) => {
      this.revokeUserAvatarObjectUrl();
      if (!blob) {
        this.userAvatarUrl = null;
        return;
      }
      this.userAvatarObjectUrl = URL.createObjectURL(blob);
      this.userAvatarUrl = this.userAvatarObjectUrl;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokeUserAvatarObjectUrl();
  }

  private revokeUserAvatarObjectUrl(): void {
    if (this.userAvatarObjectUrl) {
      URL.revokeObjectURL(this.userAvatarObjectUrl);
      this.userAvatarObjectUrl = undefined;
    }
  }

  get userInitials(): string {
    const name = (this.userName || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
    return (first + last).toUpperCase() || 'U';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
