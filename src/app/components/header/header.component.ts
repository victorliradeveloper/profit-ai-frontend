import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth/auth.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthStateService } from "../../services/auth/auth-state.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService
  ) {}

  ngOnInit() {
    this.authState.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.isAuthenticated = !!session.token;
        this.userName = session.userName;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
