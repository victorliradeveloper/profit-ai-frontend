import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChildren, Input, OnChanges, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ColumnResizeDirective } from '../../shared/directives/column-resize.directive';
import { DataTableCellDefDirective } from './data-table-cell-def.directive';
import { DataTableColumn } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatSortModule, MatTableModule, ColumnResizeDirective],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input() rows: unknown[] = [];
  @Input() pageSize = 50;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() filter = '';
  @Input() filterKeys: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ContentChildren(DataTableCellDefDirective) cellTemplates!: QueryList<DataTableCellDefDirective>;

  readonly dataSource = new MatTableDataSource<unknown>([]);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.dataSource.data = this.rows || [];
    this.applyFilter();
  }

  get displayedColumns(): string[] {
    return (this.columns || []).map((c) => c.key);
  }

  getCellTemplate(key: string): TemplateRef<unknown> | null {
    const match = (this.cellTemplates || []).find((t) => t.key === key);
    return match?.template ?? null;
  }

  headerAlignClass(col: DataTableColumn): string {
    if (col.align === 'right') return 'text-right';
    if (col.align === 'center') return 'text-center';
    return 'text-left';
  }

  private applyFilter(): void {
    const keys = this.filterKeys?.length ? this.filterKeys : this.displayedColumns;
    this.dataSource.filterPredicate = (row, filter) => {
      const v = (filter || '').trim().toLowerCase();
      if (!v) return true;
      return keys.some((k) => String(this.getValue(row, k) ?? '').toLowerCase().includes(v));
    };

    this.dataSource.filter = (this.filter || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getValue(row: unknown, key: string): unknown {
    if (!row || typeof row !== 'object') return undefined;
    return (row as Record<string, unknown>)[key];
  }
}

