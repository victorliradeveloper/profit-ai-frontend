export type DataTableColumn = {
  key: string;
  header: string;
  sortable?: boolean;
  sortAccessor?: (row: unknown) => string | number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
};

