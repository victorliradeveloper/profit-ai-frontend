import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appColumnResize]',
  standalone: true,
})
export class ColumnResizeDirective implements OnDestroy {
  @Input('appColumnResize') columnKey!: string;

  @Input() minWidthPx = 80;
  @Input() maxWidthPx = 800;

  private startX = 0;
  private startWidth = 0;
  private activePointerId: number | null = null;
  private removeMoveListener?: () => void;
  private removeUpListener?: () => void;
  private removeCancelListener?: () => void;
  private removeLostCaptureListener?: () => void;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'touch-action', 'none');
  }

  ngOnDestroy(): void {
    this.onEnd();
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.columnKey) return;
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.activePointerId !== null) this.onEnd();

    const headerCell = this.getHeaderCell();
    const table = this.getTable();
    if (!headerCell || !table) return;

    this.activePointerId = event.pointerId;

    try {
      this.el.nativeElement.setPointerCapture(event.pointerId);
    } catch {
    }

    this.startX = event.clientX;
    this.startWidth = headerCell.getBoundingClientRect().width;

    this.renderer.addClass(document.body, 'select-none');
    this.renderer.setStyle(document.body, 'cursor', 'col-resize');

    this.removeMoveListener = this.renderer.listen(this.el.nativeElement, 'pointermove', (e: PointerEvent) =>
      this.onPointerMove(e, table),
    );
    this.removeUpListener = this.renderer.listen(this.el.nativeElement, 'pointerup', (e: PointerEvent) => this.onPointerUp(e));
    this.removeCancelListener = this.renderer.listen(this.el.nativeElement, 'pointercancel', (e: PointerEvent) => this.onPointerUp(e));
    this.removeLostCaptureListener = this.renderer.listen(this.el.nativeElement, 'lostpointercapture', () => this.onEnd());
  }

  private onPointerMove(event: PointerEvent, table: HTMLElement): void {
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    const deltaX = event.clientX - this.startX;
    const next = this.clamp(Math.round(this.startWidth + deltaX), this.minWidthPx, this.maxWidthPx);
    this.applyWidthPx(table, this.columnKey, next);
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    this.onEnd();
  }

  private onEnd(): void {
    if (this.activePointerId !== null) {
      try {
        this.el.nativeElement.releasePointerCapture(this.activePointerId);
      } catch {
      }
    }
    this.activePointerId = null;
    this.renderer.removeClass(document.body, 'select-none');
    this.renderer.removeStyle(document.body, 'cursor');
    this.teardownListeners();
  }

  private teardownListeners(): void {
    if (this.removeMoveListener) this.removeMoveListener();
    if (this.removeUpListener) this.removeUpListener();
    if (this.removeCancelListener) this.removeCancelListener();
    if (this.removeLostCaptureListener) this.removeLostCaptureListener();
    this.removeMoveListener = undefined;
    this.removeUpListener = undefined;
    this.removeCancelListener = undefined;
    this.removeLostCaptureListener = undefined;
  }

  private applyWidthPx(table: HTMLElement, columnKey: string, widthPx: number): void {
    const selector = `.mat-column-${CSS.escape(columnKey)}, .cdk-column-${CSS.escape(columnKey)}`;
    const nodes = table.querySelectorAll<HTMLElement>(selector);
    nodes.forEach((node) => {
      this.renderer.setStyle(node, 'width', `${widthPx}px`);
      this.renderer.setStyle(node, 'min-width', `${widthPx}px`);
      this.renderer.setStyle(node, 'max-width', `${widthPx}px`);
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

