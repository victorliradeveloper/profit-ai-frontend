import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthStateService } from './services/auth/auth-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly showFooter$ = this.authState.isAuthenticated$.pipe(map((isAuth) => !isAuth));

  constructor(private authState: AuthStateService) {}
}
