import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableComponent } from '../../../../components/table/data-table/data-table.component';
import { DataTableCellDefDirective } from '../../../../components/table/data-table/data-table-cell-def.directive';
import { DataTableColumn } from '../../../../components/table/data-table/data-table.types';
import { CategoryRow } from './table.types';

@Component({
  selector: 'app-planning-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, DataTableComponent, DataTableCellDefDirective],
  templateUrl: './table.component.html',
})
export class PlanningTableComponent {
  @Input() rows: CategoryRow[] = [];
  @Input() filter = '';

  @Output() rowAction = new EventEmitter<{ action: 'details' | 'edit' | 'archive'; row: CategoryRow }>();

  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Nome', sortable: true, resizable: true },
    { key: 'icon', header: 'Ícone', sortable: false, resizable: true },
    { key: 'color', header: 'Cor', sortable: false, resizable: true },
    { key: 'actions', header: 'Ações', sortable: false, resizable: false, align: 'left' },
  ];

  onAction(action: 'details' | 'edit' | 'archive', row: CategoryRow): void {
    this.rowAction.emit({ action, row });
  }
}

