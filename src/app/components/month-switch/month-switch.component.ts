import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-month-switch',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './month-switch.component.html',
})
export class MonthSwitchComponent {
  private static readonly FIRST_CHAR_INDEX = 0;
  private static readonly AFTER_FIRST_CHAR_INDEX = 1;
  private static readonly MONTH_START_DAY = 1;
  private static readonly MONTH_STEP = 1;

  private readonly formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

  private _month: Date = this.asMonthStart(new Date());

  @Input()
  set month(value: Date) {
    this._month = this.asMonthStart(value);
    this.label = this.formatLabel(this._month);
  }
  get month(): Date {
    return this._month;
  }

  @Output() monthChange = new EventEmitter<Date>();

  label = this.formatLabel(this._month);

  prev(): void {
    const d = this._month;
    this.monthChange.emit(new Date(d.getFullYear(), d.getMonth() - MonthSwitchComponent.MONTH_STEP, MonthSwitchComponent.MONTH_START_DAY));
  }

  next(): void {
    const d = this._month;
    this.monthChange.emit(new Date(d.getFullYear(), d.getMonth() + MonthSwitchComponent.MONTH_STEP, MonthSwitchComponent.MONTH_START_DAY));
  }

  private asMonthStart(d: Date): Date {
    const base = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
    return new Date(base.getFullYear(), base.getMonth(), MonthSwitchComponent.MONTH_START_DAY);
  }

  private formatLabel(d: Date): string {
    const raw = this.formatter.format(d);
    return this.capitalizeFirstLetter(raw);
  }

  private capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    const first = value.charAt(MonthSwitchComponent.FIRST_CHAR_INDEX).toUpperCase();
    const rest = value.slice(MonthSwitchComponent.AFTER_FIRST_CHAR_INDEX);
    return first + rest;
  }
}

