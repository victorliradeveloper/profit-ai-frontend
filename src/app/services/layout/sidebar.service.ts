import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly openedSubject = new BehaviorSubject<boolean>(true);
  readonly opened$ = this.openedSubject.asObservable();

  get opened(): boolean {
    return this.openedSubject.value;
  }

  setOpened(opened: boolean): void {
    this.openedSubject.next(opened);
  }

  toggle(): void {
    this.setOpened(!this.opened);
  }

  open(): void {
    this.setOpened(true);
  }

  close(): void {
    this.setOpened(false);
  }
}

