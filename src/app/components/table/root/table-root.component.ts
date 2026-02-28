import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TableStateService } from '../state/table-state.service';

@Component({
  selector: 'app-table-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-root.component.html',
  styleUrl: './table-root.component.scss',
  providers: [
    TableStateService,
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const intl = new MatPaginatorIntl();
        intl.itemsPerPageLabel = 'Linhas por página:';
        intl.nextPageLabel = 'Próxima página';
        intl.previousPageLabel = 'Página anterior';
        intl.firstPageLabel = 'Primeira página';
        intl.lastPageLabel = 'Última página';
        intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) return `0 de ${length}`;
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1}-${endIndex} de ${length}`;
        };
        return intl;
      },
    },
  ],
})
export class TableRootComponent {}

