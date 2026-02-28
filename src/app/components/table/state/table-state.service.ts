import { Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CategoryRow, TableCategoryType } from './table.types';

@Injectable()
export class TableStateService {
  selectedCategoryType: TableCategoryType = 'despesa';
  showSearch = false;
  searchValue = '';

  readonly displayedColumns: Array<keyof CategoryRow | 'actions'> = ['name', 'icon', 'color', 'actions'];
  readonly dataSource = new MatTableDataSource<CategoryRow>(this.getMockRowsFor('despesa'));

  private paginator?: MatPaginator;

  constructor() {
    this.dataSource.filterPredicate = (data, filter) => {
      const v = (filter || '').trim().toLowerCase();
      if (!v) return true;
      return data.name.toLowerCase().includes(v) || data.icon.toLowerCase().includes(v) || data.color.toLowerCase().includes(v);
    };
  }

  setPaginator(paginator: MatPaginator): void {
    this.paginator = paginator;
    this.dataSource.paginator = paginator;
  }

  setSort(sort: MatSort): void {
    this.dataSource.sort = sort;
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchValue = '';
      this.applyFilter('');
    }
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
    if (this.paginator) this.paginator.firstPage();
  }

  setCategoryType(type: TableCategoryType): void {
    this.selectedCategoryType = type;
    this.dataSource.data = this.getMockRowsFor(type);
    this.applyFilter(this.searchValue);
  }

  onRefresh(): void {
    this.dataSource.data = this.getMockRowsFor(this.selectedCategoryType);
    this.applyFilter(this.searchValue);
  }

  onAddCategory(): void {
    // Placeholder: open dialog / navigate to form.
  }

  onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    // Placeholder for future integration.
    void action;
    void row;
  }

  get categoryTypeLabel(): string {
    return this.selectedCategoryType === 'despesa' ? 'Categoria de Despesas' : 'Categoria de Receitas';
  }

  private getMockRowsFor(type: TableCategoryType): CategoryRow[] {
    if (type === 'receita') {
      return [
        { name: 'Salário', icon: 'payments', color: '#10b780' },
        { name: 'Freelancer', icon: 'work', color: '#42a5f5' },
        { name: 'Investimentos', icon: 'trending_up', color: '#7c3aed' },
        { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      ];
    }

    return [
      { name: 'Alimentação', icon: 'restaurant', color: '#ef4444' },
      { name: 'Assinatura', icon: 'subscriptions', color: '#a855f7' },
      { name: 'Casa', icon: 'home', color: '#06b6d4' },
      { name: 'Compras', icon: 'shopping_bag', color: '#a855f7' },
      { name: 'Educação', icon: 'school', color: '#a855f7' },
      { name: 'Lazer', icon: 'sports_esports', color: '#f59e0b' },
      { name: 'Operação bancária', icon: 'account_balance', color: '#a855f7' },
      { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      { name: 'Pix', icon: 'qr_code_2', color: '#a855f7' },
      { name: 'Saúde', icon: 'local_hospital', color: '#84cc16' },
      { name: 'Serviços', icon: 'handyman', color: '#16a34a' },
      { name: 'Supermercado', icon: 'shopping_cart', color: '#ef4444' },
      { name: 'Transporte', icon: 'directions_bus', color: '#2563eb' },
      { name: 'Viagem', icon: 'flight', color: '#06b6d4' },
    ];
  }
}

