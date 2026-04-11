import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { CategoriesTableComponent } from './components/table/table.component';
import { CategoryRow } from './components/table/table.types';
import { CategoriesDataService, CategoryType } from '../../services/categories/categories-data.service';
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
  private readonly data = inject(CategoriesDataService);
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);

  selectedCategoryType: CategoryType = 'despesa';
  showSearch = false;
  searchValue = '';

  rows: CategoryRow[] = this.data.getRows(this.selectedCategoryType);

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchValue = '';
  }

  setCategoryType(type: CategoryType): void {
    this.selectedCategoryType = type;
    this.rows = this.data.getRows(type);
  }

  async onAddCategory(): Promise<void> {
    const result = await this.openCategoryEditor({
      name: '',
      title: 'Nova categoria',
      icon: 'restaurant',
      color: '#ef4444',
    });
    if (!result) return;
    const newRow: CategoryRow = {
      id: `category-${crypto.randomUUID()}`,
      name: result.name,
      icon: result.icon,
      color: result.color,
    };
    this.rows = [newRow, ...this.rows];
  }

  onRefresh(): void {
    this.rows = this.data.getRows(this.selectedCategoryType);
  }

  onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    if (action === 'edit') void this.openEditCategoryModal(row);
  }

  private async openEditCategoryModal(row: CategoryRow): Promise<void> {
    const result = await this.openCategoryEditor({
      name: row.name,
      icon: row.icon,
      color: row.color,
    });
    if (!result) return;
    this.rows = this.rows.map(r =>
      r.id === row.id ? { ...r, name: result.name, icon: result.icon, color: result.color } : r,
    );
  }

  private async openCategoryEditor(
    data: EditCategoryModalData,
  ): Promise<EditCategoryModalPayload | null> {
    const ref = this.dialog.open<
      EditCategoryModalComponent,
      EditCategoryModalData,
      EditCategoryModalPayload | null
    >(EditCategoryModalComponent, {
      data,
      panelClass: 'edit-category-modal',
      autoFocus: false,
      maxWidth: 'min(100vw - 32px, 900px)',
      maxHeight: '90vh',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    const value = await firstValueFrom(ref.afterClosed());
    return value ?? null;
  }

  get categoryTypeLabel(): string {
    return this.selectedCategoryType === 'despesa'
      ? 'Categoria de Despesas'
      : 'Categoria de Receitas';
  }
}
