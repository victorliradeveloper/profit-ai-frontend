import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableStateService } from '../state/table-state.service';

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatInputModule, MatMenuModule, MatTooltipModule],
  templateUrl: './table-header.component.html',
})
export class TableHeaderComponent {
  constructor(public readonly state: TableStateService) {}
}

