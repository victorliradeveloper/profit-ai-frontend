import { AbstractControl, ValidationErrors } from '@angular/forms';

function valueAsString(control: AbstractControl | null): string {
  const value = control?.value;
  return typeof value === 'string' ? value : '';
}

/** Group-level: new and confirm must match (`passwordMismatch` on the group). */
export function passwordsMismatchCrossFieldValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = valueAsString(control.get('newPassword'));
  const confirmPassword = valueAsString(control.get('confirmPassword'));
  if (!newPassword || !confirmPassword) return null;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

/** Group-level: new must differ from current (`sameAsCurrent` on the group). */
export function sameAsCurrentCrossFieldValidator(control: AbstractControl): ValidationErrors | null {
  const currentPassword = valueAsString(control.get('currentPassword'));
  const newPassword = valueAsString(control.get('newPassword'));
  if (!currentPassword || !newPassword) return null;
  return currentPassword === newPassword ? { sameAsCurrent: true } : null;
}
