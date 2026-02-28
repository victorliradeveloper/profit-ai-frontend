import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TransactionsSummaryCard = {
  title: string;
  value: string;
  icon: string;
  iconBg: string;
};

@Component({
  selector: 'app-transactions-summary-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './transactions-summary-cards.component.html',
})
export class TransactionsSummaryCardsComponent {
  @Input() cards: TransactionsSummaryCard[] = [];
}

