import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent } from '../../../../components/table/data-table/data-table.component';
import { DataTableCellDefDirective } from '../../../../components/table/data-table/data-table-cell-def.directive';
import { DataTableColumn } from '../../../../components/table/data-table/data-table.types';
import { TransactionsBalanceFooterComponent } from '../transactions-balance-footer/transactions-balance-footer.component';
import { TransactionRow } from './table.types';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DataTableComponent,
    DataTableCellDefDirective,
    TransactionsBalanceFooterComponent,
  ],
  templateUrl: './table.component.html',
})
export class TransactionsTableComponent {
  @Input() columns: Array<DataTableColumn<TransactionRow>> = [];
  @Input() rows: TransactionRow[] = [];
  @Input() projectedDayEndBalance = 'R$ 0,00';

  formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

