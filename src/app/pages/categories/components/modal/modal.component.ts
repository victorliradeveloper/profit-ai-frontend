import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export type EditCategoryNameModalData = {
  name: string;
};

export type EditCategoryNameModalResult = {
  name: string;
} | null;

@Component({
  selector: 'app-edit-category-name-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EditCategoryNameModalComponent {
  readonly nameControl: FormControl<string>;

  constructor(
    private readonly dialogRef: MatDialogRef<EditCategoryNameModalComponent, EditCategoryNameModalResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: EditCategoryNameModalData,
  ) {
    this.nameControl = new FormControl(data.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    const name = this.nameControl.value.trim();
    if (!name) {
      this.nameControl.setValue('');
      this.nameControl.markAsTouched();
      return;
    }
    this.dialogRef.close({ name });
  }
}

