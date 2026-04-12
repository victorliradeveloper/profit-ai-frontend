/** True when `value` is a non-empty string after trim (narrows to `string`). */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
