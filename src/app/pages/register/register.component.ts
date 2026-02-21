import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { ICONS } from '../../constants/icons';
import { LoggerService } from '../../services/logger/logger.service';
import { ApiErrorService } from '../../services/http/api-error.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  readonly ICONS = ICONS;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    },
    { validators: [this.passwordsMatchValidator] }
  );

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private apiError: ApiErrorService,
    private fb: FormBuilder
  ) {}

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.errors?.['passwordMismatch']) {
        this.errorMessage = 'As senhas não coincidem!';
        return;
      }

      const pwd = this.form.get('password')?.value as string | null;
      if (pwd && pwd.length < 6) {
        this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
        return;
      }

      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Preparar dados para envio (sem confirmPassword)
    const value = this.form.getRawValue();
    const registerPayload = {
      name: value.name!.trim(),
      email: value.email!.trim().toLowerCase(),
      password: value.password!
    };

    this.authService.register(registerPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        // Redirecionar para a página de perfil após 1 segundo
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.logger.error('Register error:', error);

        const serverMessage = this.apiError.getServerMessage(error) || '';
        if (error.status === 400) {
          const errorMsg = serverMessage.toLowerCase();
          if (errorMsg.includes('email')) {
            this.errorMessage = 'Email inválido. Verifique o formato do email.';
            return;
          }
          if (errorMsg.includes('password') || errorMsg.includes('characters')) {
            this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
            return;
          }
        }

        this.errorMessage = this.apiError.message(error, {
          conflict: 'Este email já está cadastrado',
          networkError: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
          fallback: 'Erro ao criar conta. Tente novamente.'
        });
      }
    });
  }

  registerWithGoogle() {
    // Aqui você implementaria a lógica de cadastro com Google
  }
}

