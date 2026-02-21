import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({
  providedIn: 'root',
})
export class AppIconsService {
  private registered = false;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {}

  /**
   * Register custom SVG icons shipped in /assets/icons.
   * Safe because the URLs are local project assets.
   */
  register(): void {
    if (this.registered) return;
    this.registered = true;

    const base = 'assets/icons';
    this.iconRegistry.addSvgIcon(
      'trending-down-3',
      this.sanitizer.bypassSecurityTrustResourceUrl(`${base}/trending-down-3.svg`),
    );
    this.iconRegistry.addSvgIcon(
      'trending-up-3',
      this.sanitizer.bypassSecurityTrustResourceUrl(`${base}/trending-up-3.svg`),
    );
    this.iconRegistry.addSvgIcon(
      'repeat-3',
      this.sanitizer.bypassSecurityTrustResourceUrl(`${base}/repeat-3.svg`),
    );
  }
}

