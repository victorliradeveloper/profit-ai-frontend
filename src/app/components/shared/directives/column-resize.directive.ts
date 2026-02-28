import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appColumnResize]',
  standalone: true,
})
export class ColumnResizeDirective implements OnDestroy {
  /**
   * Column key from matColumnDef, e.g. "name" => class ".mat-column-name"
   */
  @Input('appColumnResize') columnKey!: string;

  @Input() minWidthPx = 80;
  @Input() maxWidthPx = 800;

  private startX = 0;
  private startWidth = 0;
  private removeMoveListener?: () => void;
  private removeUpListener?: () => void;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnDestroy(): void {
    this.teardownListeners();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.columnKey) return;

    event.preventDefault();
    event.stopPropagation();

    const headerCell = this.getHeaderCell();
    const table = this.getTable();
    if (!headerCell || !table) return;

    this.startX = event.clientX;
    this.startWidth = headerCell.getBoundingClientRect().width;

    // UX: prevent text selection while dragging
    this.renderer.addClass(document.body, 'select-none');
    this.renderer.setStyle(document.body, 'cursor', 'col-resize');

    this.removeMoveListener = this.renderer.listen('document', 'mousemove', (e: MouseEvent) =>
      this.onMouseMove(e, table),
    );
    this.removeUpListener = this.renderer.listen('document', 'mouseup', () => this.onMouseUp());
  }

  private onMouseMove(event: MouseEvent, table: HTMLElement): void {
    const deltaX = event.clientX - this.startX;
    const next = this.clamp(this.startWidth + deltaX, this.minWidthPx, this.maxWidthPx);
    this.applyWidthPx(table, this.columnKey, next);
  }

  private onMouseUp(): void {
    this.renderer.removeClass(document.body, 'select-none');
    this.renderer.removeStyle(document.body, 'cursor');
    this.teardownListeners();
  }

  private teardownListeners(): void {
    if (this.removeMoveListener) this.removeMoveListener();
    if (this.removeUpListener) this.removeUpListener();
    this.removeMoveListener = undefined;
    this.removeUpListener = undefined;
  }

  private applyWidthPx(table: HTMLElement, columnKey: string, widthPx: number): void {
    // MatTable cells include .mat-column-<key> (and sometimes .cdk-column-<key>)
    const selector = `.mat-column-${CSS.escape(columnKey)}, .cdk-column-${CSS.escape(columnKey)}`;
    const nodes = table.querySelectorAll<HTMLElement>(selector);
    nodes.forEach((node) => {
      node.style.width = `${widthPx}px`;
      node.style.minWidth = `${widthPx}px`;
      node.style.maxWidth = `${widthPx}px`;
    });
  }

  private getHeaderCell(): HTMLElement | null {
    return this.el.nativeElement.closest('th');
  }

  private getTable(): HTMLElement | null {
    return this.el.nativeElement.closest('table');
  }

  private clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }
}

