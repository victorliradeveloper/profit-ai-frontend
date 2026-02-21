import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterBottomComponent } from '../../molecules/footer-bottom/footer-bottom.component';
import { FooterCompanyInfoComponent } from '../../molecules/footer-company-info/footer-company-info.component';
import { FooterLinksColumnComponent, FooterLink } from '../../molecules/footer-links-column/footer-links-column.component';
import { FooterSocialLinksComponent } from '../../molecules/footer-social-links/footer-social-links.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    FooterCompanyInfoComponent,
    FooterLinksColumnComponent,
    FooterSocialLinksComponent,
    FooterBottomComponent,
  ],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  platformLinks: FooterLink[] = [
    { label: 'Sobre', href: '/about' },
    { label: 'Contato', href: '/contact' },
    { label: 'Ajuda', href: '/help' },
  ];

  resourceLinks: FooterLink[] = [
    { label: 'Gestão de gastos', href: '#' },
    { label: 'Metas e alertas', href: '#' },
    { label: 'Recomendações por IA', href: '#' },
  ];
}

