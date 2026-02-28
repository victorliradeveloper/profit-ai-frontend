import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transactions-balance-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-balance-footer.component.html',
})
export class TransactionsBalanceFooterComponent {
  @Input() label = 'Saldo Previsto Final do Dia';
  @Input() value = 'R$ 0,00';
}

