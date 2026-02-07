import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  readonly ICONS = ICONS;
  showPassword: boolean = false;

  loginData = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirecionar para a página de perfil
        this.router.navigate(['/profile']);
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Email ou senha incorretos';
        } else if (error.status === 404) {
          this.errorMessage = 'Usuário não encontrado';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
        this.logger.error('Login error:', error);
      }
    });
  }

  loginWithGoogle() {
    // Aqui você implementaria a lógica de autenticação com Google
  }
}
