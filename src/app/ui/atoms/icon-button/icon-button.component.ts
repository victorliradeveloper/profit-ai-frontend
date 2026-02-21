import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './icon-button.component.html',
})
export class IconButtonComponent {
  @Input() icon: string = '';
  @Input() ariaLabel: string = '';
  @Input() buttonClass: string = '';
  @Input() iconClass: string = '';
  @Output() pressed = new EventEmitter<void>();
}

