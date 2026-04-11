import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MonthSwitchComponent } from '../../components/month-switch/month-switch.component';
import { DataTableColumn } from '../../components/table/data-table/data-table.types';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { TransactionsDataService } from '../../services/transactions/transactions-data.service';
import { TransactionsFiltersComponent } from './components/transactions-filters/transactions-filters.component';
import { TransactionsSummaryCardsComponent } from './components/transactions-summary-cards/transactions-summary-cards.component';
import { TransactionsTableComponent } from './components/table/table.component';
import { TransactionRow } from './components/table/table.types';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TableToolbarComponent,
    MonthSwitchComponent,
    TransactionsFiltersComponent,
    TransactionsSummaryCardsComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  private readonly dataService = inject(TransactionsDataService);

  readonly currentMonth = signal(new Date());

  readonly columns: DataTableColumn<TransactionRow>[] = [
    { key: 'status', header: 'Situação', sortable: false, resizable: false },
    {
      key: 'date',
      header: 'Data',
      sortable: true,
      resizable: true,
      sortAccessor: this.dateSortAccessor.bind(this),
    },
    { key: 'description', header: 'Descrição', sortable: true, resizable: true },
    { key: 'category', header: 'Categoria', sortable: false, resizable: true },
    {
      key: 'value',
      header: 'Valor',
      sortable: true,
      resizable: true,
      align: 'right',
    },
    { key: 'actions', header: 'Ações', sortable: false, resizable: false, align: 'right' },
  ];

  readonly rows = computed(() => this.dataService.rows);
  readonly summaryCards = computed(() => this.dataService.summaryCards);
  readonly projectedDayEndBalance = computed(() => this.dataService.projectedDayEndBalance);

  readonly currentMonthLabel = computed(() =>
    this.currentMonth().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly isCurrentMonth = computed(() => {
    const today = new Date();
    const month = this.currentMonth();
    return (
      today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth()
    );
  });

  onMonthChange(month: Date): void {
    this.currentMonth.set(month);
  }

  onFiltersChange(filters: unknown): void {
    void filters;
  }

  onExport(): void {
    console.log('Exporting transactions:', {
      month: this.currentMonth(),
      rows: this.rows(),
    });
  }

  onRowAction(action: string, row: TransactionRow): void {
    void row;
    switch (action) {
      case 'edit':
        break;
      case 'delete':
        break;
      case 'duplicate':
        break;
    }
  }

  private dateSortAccessor(row: TransactionRow): number | string {
    const [day, month, year] = row.date.split('/').map(Number);
    if (!day || !month || !year) return row.date;
    return new Date(year, month - 1, day).getTime();
  }
}
