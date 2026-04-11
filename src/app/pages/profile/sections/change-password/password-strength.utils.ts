import type { PasswordRequirement, PasswordStrength } from './change-password-section.types';

export function calculatePasswordStrength(pwd: string, minLength: number): PasswordStrength {
  if (!pwd) {
    return { score: 0, label: '—', barClass: 'bg-gray-200' };
  }

  const checks = [
    pwd.length >= minLength,
    pwd.length >= 10,
    /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ];

  const passedCount = Math.min(checks.filter(Boolean).length, 5);
  const tierIndex = Math.max(0, Math.min(passedCount - 1, 4));

  const labels = ['Fraca', 'Média', 'Boa', 'Forte', 'Excelente'];
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600', 'bg-blue-600'];

  return {
    score: passedCount,
    label: labels[tierIndex],
    barClass: colors[tierIndex],
  };
}

export function calculatePasswordRequirements(
  pwd: string,
  current: string,
  minLength: number,
): PasswordRequirement[] {
  return [
    {
      label: `Mínimo de ${minLength} caracteres`,
      ok: pwd.length >= minLength,
    },
    {
      label: '1 letra maiúscula e 1 minúscula',
      ok: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    },
    { label: 'Pelo menos 1 número', ok: /\d/.test(pwd) },
    { label: 'Pelo menos 1 caractere especial', ok: /[^A-Za-z0-9]/.test(pwd) },
    { label: 'Diferente da senha atual', ok: pwd !== current },
  ];
}
