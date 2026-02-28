import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DataTableComponent } from '../../components/table/data-table/data-table.component';
import { DataTableCellDefDirective } from '../../components/table/data-table/data-table-cell-def.directive';
import { DataTableColumn } from '../../components/table/data-table/data-table.types';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, DataTableComponent, DataTableCellDefDirective, TableToolbarComponent],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  readonly columns: DataTableColumn[] = [
    { key: 'status', header: 'Situação', sortable: false, resizable: false },
    { key: 'date', header: 'Data', sortable: true, resizable: true },
    { key: 'description', header: 'Descrição', sortable: true, resizable: true },
    { key: 'category', header: 'Categoria', sortable: false, resizable: true },
    { key: 'account', header: 'Conta', sortable: true, resizable: true },
    { key: 'value', header: 'Valor', sortable: true, resizable: true, align: 'right' },
    { key: 'actions', header: 'Ações', sortable: false, resizable: false, align: 'right' },
  ];

  readonly rows: TransactionRow[] = [
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Casa',
      categoryName: 'Casa',
      categoryIcon: 'home',
      categoryColor: '#06b6d4',
      account: 'Wallet',
      value: 2000,
      type: 'expense',
    },
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Assinatura',
      categoryName: 'Assinatura',
      categoryIcon: 'subscriptions',
      categoryColor: '#a855f7',
      account: 'Wallet',
      value: 33.33,
      type: 'expense',
    },
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Salário',
      categoryName: 'Salário',
      categoryIcon: 'payments',
      categoryColor: '#10b780',
      account: 'Wallet',
      value: 5000,
      type: 'income',
    },
  ];

  formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

type TransactionRow = {
  status: 'ok' | 'pending';
  date: string;
  description: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  account: string;
  value: number;
  type: 'income' | 'expense';
};

