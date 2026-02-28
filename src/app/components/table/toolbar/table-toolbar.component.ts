import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-toolbar.component.html',
})
export class TableToolbarComponent {
  @Input() containerClass = '';
}

