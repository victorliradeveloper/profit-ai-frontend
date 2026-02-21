import { Component } from '@angular/core';
import { HeaderComponent } from './ui/organisms/header/header.component';
import { SidebarComponent } from './ui/organisms/sidebar/sidebar.component';
import { FooterComponent } from './ui/organisms/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
