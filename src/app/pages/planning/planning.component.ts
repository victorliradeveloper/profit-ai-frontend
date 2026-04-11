import { CommonModule } from '@angular/common';
import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MonthSwitchComponent } from '../../components/month-switch/month-switch.component';
import { DataTableColumn } from '../../components/table/data-table/data-table.types';
import { TableToolbarComponent } from '../../components/table/toolbar/table-toolbar.component';
import { TransactionsDataService } from '../../services/transactions/transactions-data.service';
import { TransactionsFiltersComponent } from '../transactions/components/transactions-filters/transactions-filters.component';
import { TransactionsSummaryCardsComponent } from '../transactions/components/transactions-summary-cards/transactions-summary-cards.component';
import { TransactionsTableComponent } from '../transactions/components/table/table.component';
import { TransactionRow } from '../transactions/components/table/table.types';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    
    // Components
    TableToolbarComponent,
    MonthSwitchComponent,
    TransactionsFiltersComponent,
    TransactionsSummaryCardsComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './planning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PlanningComponent {
  // Services
  private readonly dataService = inject(TransactionsDataService);

  // State
  readonly currentMonth = signal(new Date());

  // Columns Definition
  readonly columns: DataTableColumn<TransactionRow>[] = this.defineColumns();

  // Computed Data (reativo!)
  readonly rows = computed(() => this.dataService.rows);
  readonly summaryCards = computed(() => this.dataService.summaryCards);
  readonly projectedDayEndBalance = computed(() => this.dataService.projectedDayEndBalance);
  readonly currentMonthLabel = computed(() => 
    this.currentMonth().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );

  // Public API
  onMonthChange(month: Date): void {
    this.currentMonth.set(month);
    // TODO: filtrar dados por mês
  }

  onExport(): void {
    // TODO: implementar exportação
    console.log('Export planning data for:', this.currentMonth());
  }

  onFiltersChange(_filters: unknown): void {
    void _filters;
  }

  // Private Methods
  private defineColumns(): DataTableColumn<TransactionRow>[] {
    return [
      { key: 'status', header: 'Situação', sortable: false, resizable: false },
      {
        key: 'date',
        header: 'Data',
        sortable: true,
        resizable: true,
        sortAccessor: this.createDateSortAccessor,
      },
      { key: 'description', header: 'Descrição', sortable: true, resizable: true },
      { key: 'category', header: 'Categoria', sortable: false, resizable: true },
      { 
        key: 'value', 
        header: 'Valor', 
        sortable: true, 
        resizable: true, 
        align: 'right' 
      },
      { key: 'actions', header: 'Ações', sortable: false, resizable: false, align: 'right' },
    ];
  }

  private createDateSortAccessor(row: TransactionRow): number | string {
    const [day, month, year] = row.date.split('/').map(Number);
    
    if (!day || !month || !year) {
      return row.date;
    }
    
    return new Date(year, month - 1, day).getTime();
  }
}