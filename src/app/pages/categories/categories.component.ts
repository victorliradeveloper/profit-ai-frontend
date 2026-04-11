import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { CategoriesTableComponent } from './components/table/table.component';
import { CategoryRow } from './components/table/table.types';
import { CategoriesDataService, CategoryType } from '../../services/categories/categories-data.service';
import { createCategoryRowId, newCategoryModalData } from './constants';
import {
  EditCategoryModalComponent,
  EditCategoryModalData,
  EditCategoryModalPayload,
} from './components/modal/modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    TableToolbarComponent,
    CategoriesTableComponent,
  ],
  templateUrl: './categories.component.html',
})

export class CategoriesComponent {
  // Services
  private readonly categoriesData = inject(CategoriesDataService);
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);

  // Constants
  private readonly dialogConfig: Partial<MatDialogConfig<EditCategoryModalData>> = {
    panelClass: 'edit-category-modal',
    autoFocus: false,
    maxWidth: 'min(100vw - 32px, 900px)',
    maxHeight: '90vh',
    scrollStrategy: this.overlay.scrollStrategies.block(),
  };

  private readonly categoryTypeLabels: Record<CategoryType, string> = {
    despesa: 'Categoria de Despesas',
    receita: 'Categoria de Receitas',
  };

  // State
  selectedCategoryType: CategoryType = 'despesa';
  showSearch = false;
  searchValue = '';
  rows: CategoryRow[] = this.categoriesData.getRows(this.selectedCategoryType);

  // Public API
  public toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchValue = '';
  }

  public setCategoryType(type: CategoryType): void {
    this.selectedCategoryType = type;
    this.rows = this.categoriesData.getRows(type);
  }

  public async onAddCategory(): Promise<void> {
    const payload = await this.openCategoryEditor(newCategoryModalData());
    if (!payload) return;

    const newRow: CategoryRow = {
      id: createCategoryRowId(),
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
    };
    this.rows = [newRow, ...this.rows];
  }

  public onRefresh(): void {
    this.rows = this.categoriesData.getRows(this.selectedCategoryType);
  }

  public onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    switch (action) {
      case 'edit':
        void this.openEditCategoryModal(row);
        break;
      case 'details':
        // TODO: open category details
        break;
      case 'archive':
        // TODO: archive category
        break;
    }
  }

  // Getters
  get categoryTypeLabel(): string {
    return this.categoryTypeLabels[this.selectedCategoryType] ?? 'Categoria';
  }

  // Private Methods
  private async openEditCategoryModal(row: CategoryRow): Promise<void> {
    const editorData: EditCategoryModalData = {
      name: row.name,
      icon: row.icon,
      color: row.color,
    };

    const payload = await this.openCategoryEditor(editorData);
    if (!payload) return;

    this.rows = this.rowsWithCategoryUpdated(this.rows, row.id, payload);
  }

  private rowsWithCategoryUpdated(
    categoryRows: CategoryRow[],
    updatedRowId: string,
    payload: EditCategoryModalPayload,
  ): CategoryRow[] {
    return categoryRows.map((categoryRow) =>
      categoryRow.id === updatedRowId
        ? { ...categoryRow, ...payload }
        : categoryRow,
    );
  }

  private async openCategoryEditor(
    data: EditCategoryModalData,
  ): Promise<EditCategoryModalPayload | null> {
    const dialogRef = this.dialog.open<
      EditCategoryModalComponent,
      EditCategoryModalData,
      EditCategoryModalPayload | null
    >(EditCategoryModalComponent, this.getDialogConfig(data));

    return firstValueFrom(dialogRef.afterClosed()).then((value) => value ?? null);
  }

  private getDialogConfig(data: EditCategoryModalData): MatDialogConfig<EditCategoryModalData> {
    return { ...this.dialogConfig, data };
  }
}