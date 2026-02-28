import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './planning.component.html',
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const intl = new MatPaginatorIntl();
        intl.itemsPerPageLabel = 'Linhas por página:';
        intl.nextPageLabel = 'Próxima página';
        intl.previousPageLabel = 'Página anterior';
        intl.firstPageLabel = 'Primeira página';
        intl.lastPageLabel = 'Última página';
        intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) return `0 de ${length}`;
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1}-${endIndex} de ${length}`;
        };
        return intl;
      },
    },
  ],
})
export class PlanningComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedCategoryType: 'despesa' | 'receita' = 'despesa';
  showSearch = false;
  searchValue = '';

  readonly displayedColumns: Array<keyof CategoryRow | 'actions'> = ['name', 'icon', 'color', 'actions'];
  readonly dataSource = new MatTableDataSource<CategoryRow>(this.getMockRowsFor('despesa'));

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter) => {
      const v = (filter || '').trim().toLowerCase();
      if (!v) return true;
      return (
        data.name.toLowerCase().includes(v) ||
        data.icon.toLowerCase().includes(v) ||
        data.color.toLowerCase().includes(v)
      );
    };
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
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  setCategoryType(type: 'despesa' | 'receita'): void {
    this.selectedCategoryType = type;
    this.dataSource.data = this.getMockRowsFor(type);
    this.applyFilter(this.searchValue);
  }

  onRefresh(): void {
    // Placeholder: here you would re-fetch categories from the API.
    this.dataSource.data = this.getMockRowsFor(this.selectedCategoryType);
    this.applyFilter(this.searchValue);
  }

  onAddCategory(): void {
    // Placeholder: open dialog / navigate to form.
  }

  onRowAction(action: 'details' | 'edit' | 'archive' | 'addSub', row: CategoryRow): void {
    // Placeholder for future integration.
    void action;
    void row;
  }

  get categoryTypeLabel(): string {
    return this.selectedCategoryType === 'despesa' ? 'Categoria de Despesas' : 'Categoria de Receitas';
  }

  private getMockRowsFor(type: 'despesa' | 'receita'): CategoryRow[] {
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

type CategoryRow = {
  name: string;
  icon: string;
  color: string;
};

