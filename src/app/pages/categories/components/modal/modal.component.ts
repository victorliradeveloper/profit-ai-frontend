import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
import {
  CategoryIconPickerModalComponent,
  CategoryIconPickerModalData,
} from '../icon-picker-modal/icon-picker-modal.component';

export type EditCategoryNameModalData = {
  name: string;
  /** When set (e.g. create flow), shown as the dialog heading. */
  title?: string;
  icon?: string;
  color?: string;
};

export type EditCategoryNameModalResult = {
  name: string;
  icon: string;
  color: string;
} | null;

const QUICK_COLORS = ['#ef4444', '#42a5f5', '#a855f7', '#84cc16'] as const;

const EXTENDED_COLORS = [
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#64748b',
  '#ffffff',
  '#000000',
] as const;

const QUICK_ICONS = ['restaurant', 'directions_car', 'checkroom', 'qr_code_2'] as const;

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
  readonly quickColors = [...QUICK_COLORS];
  readonly extendedColors = [...EXTENDED_COLORS];
  readonly quickIcons = [...QUICK_ICONS];

  selectedIcon: string;
  selectedColor: string;
  showExtendedColors = false;

  constructor(
    private readonly dialogRef: MatDialogRef<EditCategoryNameModalComponent, EditCategoryNameModalResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: EditCategoryNameModalData,
    private readonly dialog: MatDialog,
  ) {
    this.nameControl = new FormControl(data.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    });
    this.selectedIcon = data.icon ?? 'restaurant';
    this.selectedColor = data.color ?? QUICK_COLORS[0];
  }

  selectColor(hex: string): void {
    this.selectedColor = hex;
  }

  openFullIconPicker(): void {
    const ref = this.dialog.open<CategoryIconPickerModalComponent, CategoryIconPickerModalData, string | null>(
      CategoryIconPickerModalComponent,
      {
        data: { currentIcon: this.selectedIcon },
        panelClass: 'category-icon-picker-modal',
        autoFocus: false,
      },
    );

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((picked) => {
        if (picked) this.selectedIcon = picked;
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
    this.dialogRef.close({
      name,
      icon: this.selectedIcon,
      color: this.selectedColor,
    });
  }
}
