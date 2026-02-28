import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TransactionsSummaryCard } from './transactions-summary-cards.types';

@Component({
  selector: 'app-transactions-summary-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './transactions-summary-cards.component.html',
})
export class TransactionsSummaryCardsComponent {
  @Input() cards: TransactionsSummaryCard[] = [];
}

