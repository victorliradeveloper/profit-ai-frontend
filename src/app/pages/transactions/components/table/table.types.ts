export type TransactionRow = {
  status: 'ok' | 'pending';
  date: string;
  description: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  value: number;
  type: 'income' | 'expense';
};

