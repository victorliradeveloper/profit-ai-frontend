import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewInit, Component, ContentChildren, Input, OnChanges, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ColumnResizeDirective } from '../../shared/directives/column-resize.directive';
import { DataTableCellDefDirective } from './data-table-cell-def.directive';
import { DataTableColumn } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, MatSortModule, MatTableModule, ColumnResizeDirective],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent implements AfterViewInit, AfterContentInit, OnChanges {
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
  private templateMap = new Map<string, TemplateRef<unknown>>();

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applySortingAccessor();
  }

  ngOnChanges(): void {
    this.dataSource.data = this.rows || [];
    this.applySortingAccessor();
    this.applyFilter();
  }

  get displayedColumns(): string[] {
    return (this.columns || []).map((c) => c.key);
  }

  getCellTemplate(key: string): TemplateRef<unknown> | null {
    if (!this.templateMap.size && this.cellTemplates) {
      // lazy init in case content templates come after inputs
      this.rebuildTemplateMap();
    }
    return this.templateMap.get(key) ?? null;
  }

  ngAfterContentInit(): void {
    this.rebuildTemplateMap();
    this.cellTemplates?.changes?.subscribe(() => this.rebuildTemplateMap());
  }

  headerAlignClass(col: DataTableColumn): string {
    if (col.align === 'right') return 'text-right';
    if (col.align === 'center') return 'text-center';
    return 'text-left';
  }

  private applyFilter(): void {
    const keys = this.filterKeys?.length ? this.filterKeys : this.displayedColumns;

    // Only uses current keys, but avoids re-creating predicate on every keystroke.
    this.dataSource.filterPredicate = (row, filter) => {
      const v = (filter || '').trim().toLowerCase();
      if (!v) return true;
      return keys.some((k) => String(this.getValue(row, k) ?? '').toLowerCase().includes(v));
    };

    this.dataSource.filter = (this.filter || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private applySortingAccessor(): void {
    const accessors = new Map<string, NonNullable<NonNullable<DataTableColumn['sortAccessor']>>>();
    (this.columns || []).forEach((c) => {
      if (c.sortAccessor) accessors.set(c.key, c.sortAccessor);
    });

    this.dataSource.sortingDataAccessor = (row: unknown, sortHeaderId: string) => {
      const accessor = accessors.get(sortHeaderId);
      if (accessor) return accessor(row);
      const v = this.getValue(row, sortHeaderId);
      return typeof v === 'number' ? v : String(v ?? '');
    };
  }

  private rebuildTemplateMap(): void {
    const map = new Map<string, TemplateRef<unknown>>();
    (this.cellTemplates || []).forEach((t) => {
      if (t.key) map.set(t.key, t.template);
    });
    this.templateMap = map;
  }

  getValue(row: unknown, key: string): unknown {
    if (!row || typeof row !== 'object') return undefined;
    return (row as Record<string, unknown>)[key];
  }
}

