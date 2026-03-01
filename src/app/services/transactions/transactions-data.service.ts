import { Injectable } from '@angular/core';
import { TransactionsSummaryCard } from '../../pages/transactions/components/transactions-summary-cards/transactions-summary-cards.types';
import { TransactionRow } from '../../pages/transactions/components/table/table.types';

@Injectable({ providedIn: 'root' })
export class TransactionsDataService {
  readonly rows: TransactionRow[] = [
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Casa',
      categoryName: 'Casa',
      categoryIcon: 'home',
      categoryColor: '#06b6d4',
      value: 2000,
      type: 'expense',
    },
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Assinatura',
      categoryName: 'Assinatura',
      categoryIcon: 'subscriptions',
      categoryColor: '#a855f7',
      value: 33.33,
      type: 'expense',
    },
    {
      status: 'ok',
      date: '28/02/2026',
      description: 'Salário',
      categoryName: 'Salário',
      categoryIcon: 'payments',
      categoryColor: '#10b780',
      value: 5000,
      type: 'income',
    },
  ];

  readonly summaryCards: TransactionsSummaryCard[] = [
    { title: 'Saldo atual', value: 'R$ 6.766,67', icon: 'account_balance', iconBg: '#42a5f5' },
    { title: 'Receitas', value: 'R$ 0,00', icon: 'north', iconBg: '#22c55e' },
    { title: 'Despesas', value: 'R$ 2.033,33', icon: 'south', iconBg: '#ef4444' },
    { title: 'Balanço mensal', value: 'R$ -2.033,33', icon: 'balance', iconBg: '#14b8a6' },
  ];

  readonly projectedDayEndBalance = 'R$ 6.766,67';
}

