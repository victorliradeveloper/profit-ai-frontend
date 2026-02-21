import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type FooterLink = {
  label: string;
  href: string;
};

@Component({
  selector: 'app-footer-links-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-links-column.component.html',
})
export class FooterLinksColumnComponent {
  @Input() title: string = '';
  @Input() links: FooterLink[] = [];
}

