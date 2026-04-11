import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORY_MATERIAL_ICONS } from './category-material-icons';

export type CategoryIconPickerModalData = {
  currentIcon: string;
};

@Component({
  selector: 'app-category-icon-picker-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './icon-picker-modal.component.html',
  styleUrl: './icon-picker-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CategoryIconPickerModalComponent {
  readonly icons = CATEGORY_MATERIAL_ICONS;

  constructor(
    private readonly dialogRef: MatDialogRef<CategoryIconPickerModalComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: CategoryIconPickerModalData,
  ) {}

  select(icon: string): void {
    this.dialogRef.close(icon);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
