import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { CategoriesTableComponent } from './components/table/table.component';
import { CategoryRow } from './components/table/table.types';
import { CategoriesDataService, CategoryType } from '../../services/categories/categories-data.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
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
  }

  onRefresh(): void {
    this.rows = this.data.getRows(this.selectedCategoryType);
  }

  onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    void action;
    void row;
  }

  get categoryTypeLabel(): string {
    return this.selectedCategoryType === 'despesa' ? 'Categoria de Despesas' : 'Categoria de Receitas';
  }
}

