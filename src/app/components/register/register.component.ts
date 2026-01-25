import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  readonly ICONS = ICONS;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // Validações
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Preparar dados para envio (sem confirmPassword)
    const registerPayload = {
      name: this.registerData.name.trim(),
      email: this.registerData.email.trim().toLowerCase(),
      password: this.registerData.password
    };

    console.log('Enviando registro:', registerPayload);

    this.authService.register(registerPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        // Redirecionar para a página de perfil após 1 segundo
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Register error:', error);
        
        if (error.status === 409) {
          this.errorMessage = error.error?.message || 'Este email já está cadastrado';
        } else if (error.status === 400) {
          // Pode ser email inválido ou senha inválida
          const errorMsg = error.error?.message || 'Dados inválidos';
          if (errorMsg.toLowerCase().includes('email')) {
            this.errorMessage = 'Email inválido. Verifique o formato do email.';
          } else if (errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('characters')) {
            this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
          } else {
            this.errorMessage = errorMsg;
          }
        } else if (error.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else {
          this.errorMessage = error.error?.message || 'Erro ao criar conta. Tente novamente.';
        }
      }
    });
  }

  registerWithGoogle() {
    console.log('Google register attempt');
    // Aqui você implementaria a lógica de cadastro com Google
  }
}
