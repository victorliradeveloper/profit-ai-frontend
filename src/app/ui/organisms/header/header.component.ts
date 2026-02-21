import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, of } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { AuthService } from "../../../services/auth/auth.service";
import { AuthStateService } from "../../../services/auth/auth-state.service";
import { FileTransferService } from "../../../services/files/file-transfer.service";
import { SidebarService } from "../../../services/layout/sidebar.service";
import { IconButtonComponent } from "../../atoms/icon-button/icon-button.component";
import { AppLogoComponent } from "../../molecules/app-logo/app-logo.component";
import { HeaderAuthLinksComponent } from "../../molecules/header-auth-links/header-auth-links.component";
import { HeaderUserMenuComponent } from "../../molecules/header-user-menu/header-user-menu.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    IconButtonComponent,
    AppLogoComponent,
    HeaderAuthLinksComponent,
    HeaderUserMenuComponent,
  ]
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
    private fileTransfer: FileTransferService,
    private sidebar: SidebarService
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

  toggleSidebar(): void {
    this.sidebar.toggle();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/configuracoes']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

