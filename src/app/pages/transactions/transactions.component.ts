import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataTableColumn } from '../../components/table/data-table/data-table.types';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { MonthSwitchComponent } from '../../components/month-switch/month-switch.component';
import { TransactionsFiltersComponent } from './components/transactions-filters/transactions-filters.component';
import { TransactionsSummaryCardsComponent } from './components/transactions-summary-cards/transactions-summary-cards.component';
import { TransactionsTableComponent } from './components/table/table.component';
import { TransactionRow } from './components/table/table.types';
import { TransactionsDataService } from '../../services/transactions/transactions-data.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TableToolbarComponent,
    TransactionsFiltersComponent,
    MonthSwitchComponent,
    TransactionsSummaryCardsComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  private readonly data = inject(TransactionsDataService);

  currentMonth = new Date();

  readonly columns: Array<DataTableColumn<TransactionRow>> = [
    { key: 'status', header: 'Situação', sortable: false, resizable: false },
    {
      key: 'date',
      header: 'Data',
      sortable: true,
      resizable: true,
      sortAccessor: (row) => {
        const v = row.date;
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

  readonly rows = this.data.rows;
  readonly summaryCards = this.data.summaryCards;
  readonly projectedDayEndBalance = this.data.projectedDayEndBalance;

  onExport(): void {
  }
}

