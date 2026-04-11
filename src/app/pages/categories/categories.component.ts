import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take } from 'rxjs';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { CategoriesTableComponent } from './components/table/table.component';
import { CategoryRow } from './components/table/table.types';
import { CategoriesDataService, CategoryType } from '../../services/categories/categories-data.service';
import {
  EditCategoryNameModalComponent,
  EditCategoryNameModalData,
  EditCategoryNameModalResult,
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

  onAddCategory(): void {
    const ref = this.dialog.open<EditCategoryNameModalComponent, EditCategoryNameModalData, EditCategoryNameModalResult>(
      EditCategoryNameModalComponent,
      {
        data: { name: '', title: 'Nova categoria', icon: 'restaurant', color: '#ef4444' },
        panelClass: 'edit-category-name-modal',
        autoFocus: false,
      },
    );

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (!result) return;
        const newRow: CategoryRow = {
          id: `category-${crypto.randomUUID()}`,
          name: result.name,
          icon: result.icon,
          color: result.color,
        };
        this.rows = [newRow, ...this.rows];
      });
  }

  onRefresh(): void {
    this.rows = this.data.getRows(this.selectedCategoryType);
  }

  onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    if (action === 'edit') this.openEditNameModal(row);
  }

  private openEditNameModal(row: CategoryRow): void {
    const ref = this.dialog.open<EditCategoryNameModalComponent, EditCategoryNameModalData, EditCategoryNameModalResult>(
      EditCategoryNameModalComponent,
      {
        data: { name: row.name, icon: row.icon, color: row.color },
        panelClass: 'edit-category-name-modal',
        autoFocus: false,
      },
    );

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (!result) return;
        this.rows = this.rows.map((r) =>
          r.id === row.id ? { ...r, name: result.name, icon: result.icon, color: result.color } : r,
        );
      });
  }

  get categoryTypeLabel(): string {
    return this.selectedCategoryType === 'despesa' ? 'Categoria de Despesas' : 'Categoria de Receitas';
  }
}

