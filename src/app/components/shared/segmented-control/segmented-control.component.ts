import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SegmentedControlItem } from './segmented-control.types';

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segmented-control.component.html',
})
export class SegmentedControlComponent {
  @Input() items: SegmentedControlItem[] = [];
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  trackById(_: number, item: SegmentedControlItem): string {
    return item.id;
  }

  select(item: SegmentedControlItem): void {
    if (item.disabled) return;
    if (this.value === item.id) return;
    this.valueChange.emit(item.id);
  }
}

