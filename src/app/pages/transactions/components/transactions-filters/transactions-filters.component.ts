import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-transactions-filters',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './transactions-filters.component.html',
})
export class TransactionsFiltersComponent {
  @Output() exportClicked = new EventEmitter<void>();

  onExportClick(): void {
    this.exportClicked.emit();
  }
}

