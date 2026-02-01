export function getServerMessage(error: any): string | null {
  return error?.error?.message || error?.error?.error || null;
}

