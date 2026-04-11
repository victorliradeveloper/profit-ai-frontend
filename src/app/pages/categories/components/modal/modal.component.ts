import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { CATEGORY_MATERIAL_ICONS } from '../icon-picker-modal/category-material-icons';
import {
  CategoryIconPickerModalComponent,
  CategoryIconPickerModalData,
} from '../icon-picker-modal/icon-picker-modal.component';

export type EditCategoryModalData = {
  name: string;
  /** When set (e.g. create flow), shown as the dialog heading. */
  title?: string;
  icon?: string;
  color?: string;
};

export type EditCategoryModalPayload = {
  name: string;
  icon: string;
  color: string;
};

type ColorSwatch = { readonly hex: string; readonly label: string };

const QUICK_COLOR_SWATCHES: readonly ColorSwatch[] = [
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#42a5f5', label: 'Azul claro' },
  { hex: '#a855f7', label: 'Roxo' },
  { hex: '#84cc16', label: 'Verde lima' },
];

const EXTENDED_COLOR_SWATCHES: readonly ColorSwatch[] = [
  { hex: '#f97316', label: 'Laranja' },
  { hex: '#eab308', label: 'Amarelo' },
  { hex: '#22c55e', label: 'Verde' },
  { hex: '#14b8a6', label: 'Verde-água' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#6366f1', label: 'Índigo' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#d946ef', label: 'Magenta' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#f43f5e', label: 'Rosa forte' },
  { hex: '#78716c', label: 'Pedra' },
  { hex: '#64748b', label: 'Cinza ardósia' },
  { hex: '#ffffff', label: 'Branco' },
  { hex: '#000000', label: 'Preto' },
];

const DEFAULT_COLOR_HEX = QUICK_COLOR_SWATCHES[0].hex;

const QUICK_ICONS = ['restaurant', 'directions_car', 'checkroom', 'qr_code_2'] as const;

const QUICK_ICON_LABELS: Record<string, string> = {
  restaurant: 'Alimentação',
  directions_car: 'Transporte',
  checkroom: 'Vestuário',
  qr_code_2: 'Pix ou QR Code',
};

const ALLOWED_MATERIAL_ICONS = new Set<string>(CATEGORY_MATERIAL_ICONS as readonly string[]);

const DEFAULT_CATEGORY_ICON = 'restaurant';

function normalizeMaterialIcon(icon: string | undefined): string {
  const v = icon?.trim();
  if (!v) return DEFAULT_CATEGORY_ICON;
  return ALLOWED_MATERIAL_ICONS.has(v) ? v : DEFAULT_CATEGORY_ICON;
}

/** Relative luminance (sRGB); used to pick checkmark contrast on color swatches. */
function luminanceIsLight(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return false;
  const toLinear = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(m[1], 16));
  const g = toLinear(parseInt(m[2], 16));
  const b = toLinear(parseInt(m[3], 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62;
}

@Component({
  selector: 'app-edit-category-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EditCategoryModalComponent {
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);

  readonly nameControl: FormControl<string>;
  readonly quickColorSwatches = [...QUICK_COLOR_SWATCHES];
  readonly extendedColorSwatches = [...EXTENDED_COLOR_SWATCHES];
  readonly quickIcons = [...QUICK_ICONS];

  selectedIcon: string;
  selectedColor: string;
  showExtendedColors = false;

  constructor(
    private readonly dialogRef: MatDialogRef<EditCategoryModalComponent, EditCategoryModalPayload | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: EditCategoryModalData,
  ) {
    this.nameControl = new FormControl(data.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    });
    this.selectedIcon = normalizeMaterialIcon(data.icon);
    this.selectedColor = data.color ?? DEFAULT_COLOR_HEX;
  }

  /** Tamanho lógico do conjunto de cores (para aria-setsize nos radios). */
  colorRadioSetSize(): number {
    return this.quickColorSwatches.length + (this.showExtendedColors ? this.extendedColorSwatches.length : 0);
  }

  /** Posição 1-based do swatch no grupo de cores. */
  colorRadioPosInSet(quick: boolean, index: number): number {
    return quick ? index + 1 : this.quickColorSwatches.length + index + 1;
  }

  quickIconLabel(icon: string): string {
    return QUICK_ICON_LABELS[icon] ?? `Ícone ${icon}`;
  }

  /** Tamanho do grupo de ícones rápidos (inclui chip extra quando aplicável). */
  iconRadioSetSize(): number {
    return this.quickIcons.length + (this.selectedIconOutsideQuick() ? 1 : 0);
  }

  /** True when the selected icon is not one of the four quick shortcuts (shows extra chip). */
  selectedIconOutsideQuick(): boolean {
    return !(QUICK_ICONS as readonly string[]).includes(this.selectedIcon);
  }

  /** Whether a hex swatch is light enough to need a dark checkmark. */
  isLightHex(hex: string): boolean {
    return luminanceIsLight(hex);
  }

  selectColor(hex: string): void {
    this.selectedColor = hex;
  }

  async openFullIconPicker(): Promise<void> {
    const ref = this.dialog.open<CategoryIconPickerModalComponent, CategoryIconPickerModalData, string | null>(
      CategoryIconPickerModalComponent,
      {
        data: { currentIcon: this.selectedIcon },
        panelClass: 'category-icon-picker-modal',
        autoFocus: 'first-tabbable',
        maxWidth: 'min(calc(100vw - 32px), 600px)',
        maxHeight: 'min(85vh, 560px)',
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      },
    );

    const picked = await firstValueFrom(ref.afterClosed());
    if (picked) this.selectedIcon = normalizeMaterialIcon(picked);
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
      icon: normalizeMaterialIcon(this.selectedIcon),
      color: this.selectedColor,
    });
  }
}
