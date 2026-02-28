import { Component } from '@angular/core';
import { TableGridComponent } from '../grid/table-grid.component';
import { TableHeaderComponent } from '../header/table-header.component';
import { TablePagerComponent } from '../pager/table-pager.component';
import { TableRootComponent } from '../root/table-root.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableRootComponent, TableHeaderComponent, TableGridComponent, TablePagerComponent],
  templateUrl: './table.component.html',
})
export class TableComponent {}

