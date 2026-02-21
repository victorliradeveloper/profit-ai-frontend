import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header-user-menu',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule],
  templateUrl: './header-user-menu.component.html',
})
export class HeaderUserMenuComponent {
  @Input() userName: string | null = null;
  @Input() userAvatarUrl: string | null = null;
  @Input() userInitials: string = 'U';

  @Output() profile = new EventEmitter<void>();
  @Output() settings = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}

