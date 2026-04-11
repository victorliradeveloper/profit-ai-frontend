import { AbstractControl } from '@angular/forms';

export function profileNameFieldMessages(minLength: number): Record<string, string> {
  return {
    required: 'Nome é obrigatório',
    minlength: `Nome deve ter pelo menos ${minLength} caracteres`,
  };
}

export function profileEmailFieldMessages(): Record<string, string> {
  return {
    required: 'Email é obrigatório',
    email: 'Email inválido',
  };
}

/** First matching invalid message when the whole form is invalid (save blocked). */
export function profileInvalidFormSummaryMessage(
  minLength: number,
  nameControl: AbstractControl,
  emailControl: AbstractControl,
): string {
  if (nameControl.errors?.['required']) return 'Nome é obrigatório';
  if (nameControl.errors?.['minlength']) {
    return `Nome deve ter pelo menos ${minLength} caracteres`;
  }
  if (emailControl.errors?.['required']) return 'Email é obrigatório';
  if (emailControl.errors?.['email']) return 'Email inválido';
  return 'Dados inválidos. Verifique as informações.';
}
