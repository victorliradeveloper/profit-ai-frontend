import { FormControl } from '@angular/forms';

/** Snapshot / API payload shape. */
export interface ProfileFormData {
  name: string;
  email: string;
}

/** Typed reactive form controls. */
export interface ProfileFormControls {
  name: FormControl<string>;
  email: FormControl<string>;
}
