import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataTableColumn } from '../../components/table/data-table/data-table.types';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { TransactionsFiltersComponent } from './components/transactions-filters/transactions-filters.component';
import { TransactionsSummaryCard, TransactionsSummaryCardsComponent } from './components/transactions-summary-cards/transactions-summary-cards.component';
import { TransactionRow, TransactionsTableComponent } from './components/table/table.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TableToolbarComponent,
    TransactionsFiltersComponent,
    TransactionsSummaryCardsComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  readonly monthLabel = 'Fevereiro 2026';

  readonly columns: DataTableColumn[] = [
    { key: 'status', header: 'Situação', sortable: false, resizable: false },
    {
      key: 'date',
      header: 'Data',
      sortable: true,
      resizable: true,
      sortAccessor: (row) => {
        const v = (row as Record<string, unknown>)?.['date'];
        if (typeof v !== 'string') return '';
        const [dd, mm, yyyy] = v.split('/').map((x) => Number(x));
        if (!dd || !mm || !yyyy) return v;
        return new Date(yyyy, mm - 1, dd).getTime();
      },
    },
    { key: 'description', header: 'Descrição', sortable: true, resizable: true },
    { key: 'category', header: 'Categoria', sortable: false, resizable: true },
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
      value: 5000,
      type: 'income',
    },
  ];

  readonly summaryCards: TransactionsSummaryCard[] = [
    { title: 'Saldo atual', value: 'R$ 6.766,67', icon: 'account_balance', iconBg: '#42a5f5' },
    { title: 'Receitas', value: 'R$ 0,00', icon: 'north', iconBg: '#22c55e' },
    { title: 'Despesas', value: 'R$ 2.033,33', icon: 'south', iconBg: '#ef4444' },
    { title: 'Balanço mensal', value: 'R$ -2.033,33', icon: 'balance', iconBg: '#14b8a6' },
  ];

  readonly projectedDayEndBalance = 'R$ 6.766,67';

  onExport(): void {
    // placeholder
  }

  prevMonth(): void {
    // placeholder
  }

  nextMonth(): void {
    // placeholder
  }
}

