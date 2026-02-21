import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';
import { LoggerService } from '../../services/logger/logger.service';
import { ApiErrorService } from '../../services/http/api-error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  readonly ICONS = ICONS;
  showPassword: boolean = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private apiError: ApiErrorService,
    private fb: FormBuilder
  ) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = this.form.getRawValue();
    this.authService.login({ email: payload.email!, password: payload.password! }).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirecionar para a página de perfil
        this.router.navigate(['/profile']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.apiError.message(error, {
          unauthorized: 'Email ou senha incorretos',
          notFound: 'Usuário não encontrado',
          fallback: 'Erro ao fazer login. Tente novamente.'
        });
        this.logger.error('Login error:', error);
      }
    });
  }

  loginWithGoogle() {
    // Aqui você implementaria a lógica de autenticação com Google
  }
}

