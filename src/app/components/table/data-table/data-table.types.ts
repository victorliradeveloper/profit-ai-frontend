export type DataTableColumn<T extends Record<string, unknown> = Record<string, unknown>> = {
  key: string;
  header: string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
};

