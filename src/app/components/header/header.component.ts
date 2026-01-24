import { Component, OnInit } from "@angular/core";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth/auth.service";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    
    // Verificar autenticação sempre que a rota mudar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthentication();
      });
  }

  checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.userName = this.authService.getUserName();
    } else {
      this.userName = null;
    }
  }

  logout() {
    this.authService.logout();
    this.checkAuthentication();
    this.router.navigate(['/login']);
  }
}
