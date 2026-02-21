import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { SidebarService } from '../../services/layout/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isHandset = false;
  sidenavMode: 'side' | 'over' = 'side';
  opened = true;
  readonly sidenavWidthPx = 280;
  private readonly destroy$ = new Subject<void>();

  get fixedTopGapPx(): number {
    // Header is sticky at top; give the sidenav a gap on desktop so it doesn't sit under it.
    // On mobile the header can be taller (flex-col), so we don't apply a fixed gap.
    return this.isHandset ? 0 : 80;
  }

  constructor(
    private authState: AuthStateService,
    private sidebar: SidebarService,
    private breakpoint: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.breakpoint
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isHandset = state.matches;
        this.sidenavMode = this.isHandset ? 'over' : 'side';

        // default behavior per breakpoint
        if (this.isAuthenticated) {
          if (this.isHandset) this.sidebar.close();
          else this.sidebar.open();
        }
      });

    this.authState.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe((session) => {
        this.isAuthenticated = !!session.token;
        if (!this.isAuthenticated) {
          this.sidebar.close();
        } else {
          if (this.isHandset) this.sidebar.close();
          else this.sidebar.open();
        }
      });

    this.sidebar.opened$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opened) => (this.opened = opened));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOpenedChange(opened: boolean): void {
    this.sidebar.setOpened(opened);
  }

  onNavItemClick(): void {
    if (this.isHandset) this.sidebar.close();
  }
}

