import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { CategoryRow, PlanningTableComponent } from './components/table/table.component';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    TableToolbarComponent,
    PlanningTableComponent,
  ],
  templateUrl: './planning.component.html',
})
export class PlanningComponent {
  selectedCategoryType: 'despesa' | 'receita' = 'despesa';
  showSearch = false;
  searchValue = '';

  rows: CategoryRow[] = this.getMockRowsFor(this.selectedCategoryType);

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchValue = '';
  }

  setCategoryType(type: 'despesa' | 'receita'): void {
    this.selectedCategoryType = type;
    this.rows = this.getMockRowsFor(type);
  }

  onAddCategory(): void {
    // placeholder
  }

  onRefresh(): void {
    // placeholder
    this.rows = this.getMockRowsFor(this.selectedCategoryType);
  }

  onRowAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
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

