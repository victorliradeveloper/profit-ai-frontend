import { Component } from '@angular/core';
import { TableComponent } from '../../components/table/table/table.component';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './planning.component.html',
})
export class PlanningComponent {}

