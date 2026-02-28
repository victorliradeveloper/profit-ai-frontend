import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent } from '../../../../components/table/data-table/data-table.component';
import { DataTableCellDefDirective } from '../../../../components/table/data-table/data-table-cell-def.directive';
import { DataTableColumn } from '../../../../components/table/data-table/data-table.types';
import { TransactionsBalanceFooterComponent } from '../transactions-balance-footer/transactions-balance-footer.component';
import { TransactionsMonthSwitchComponent } from '../transactions-month-switch/transactions-month-switch.component';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DataTableComponent,
    DataTableCellDefDirective,
    TransactionsMonthSwitchComponent,
    TransactionsBalanceFooterComponent,
  ],
  templateUrl: './table.component.html',
})
export class TransactionsTableComponent {
  @Input() monthLabel = '';
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: TransactionRow[] = [];
  @Input() projectedDayEndBalance = 'R$ 0,00';

  @Output() prevMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();

  formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

export type TransactionRow = {
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

