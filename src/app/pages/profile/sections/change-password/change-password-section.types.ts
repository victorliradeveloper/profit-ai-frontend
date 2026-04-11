import { FormControl } from '@angular/forms';

/** Control map for typed `FormGroup` (not the raw value shape). */
export interface PasswordFormControls {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

export interface PasswordStrength {
  score: number;
  label: string;
  barClass: string;
}

export interface PasswordRequirement {
  label: string;
  ok: boolean;
}
