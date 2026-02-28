import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appDataTableCellDef]',
  standalone: true,
})
export class DataTableCellDefDirective {
  @Input('appDataTableCellDef') key!: string;

  constructor(public readonly template: TemplateRef<unknown>) {}
}

