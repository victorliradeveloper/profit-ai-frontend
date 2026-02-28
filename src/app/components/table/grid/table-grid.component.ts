import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnResizeDirective } from '../../shared/directives/column-resize.directive';
import { TableStateService } from '../state/table-state.service';

@Component({
  selector: 'app-table-grid',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSortModule, MatTableModule, MatTooltipModule, ColumnResizeDirective],
  templateUrl: './table-grid.component.html',
})
export class TableGridComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public readonly state: TableStateService) {}

  ngAfterViewInit(): void {
    this.state.setSort(this.sort);
  }
}

