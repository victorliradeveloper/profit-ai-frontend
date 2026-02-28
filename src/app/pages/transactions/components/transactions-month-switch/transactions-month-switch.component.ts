import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transactions-month-switch',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './transactions-month-switch.component.html',
})
export class TransactionsMonthSwitchComponent {
  @Input() label = 'Fevereiro 2026';
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}

