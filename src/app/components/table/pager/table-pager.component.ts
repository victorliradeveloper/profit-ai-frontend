import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TableStateService } from '../state/table-state.service';

@Component({
  selector: 'app-table-pager',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './table-pager.component.html',
})
export class TablePagerComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public readonly state: TableStateService) {}

  ngAfterViewInit(): void {
    this.state.setPaginator(this.paginator);
  }
}

