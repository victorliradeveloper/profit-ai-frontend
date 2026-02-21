import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer-bottom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-bottom.component.html',
})
export class FooterBottomComponent {
  @Input() currentYear: number = new Date().getFullYear();
}

