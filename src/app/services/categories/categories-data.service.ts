import { Injectable } from '@angular/core';
import { CategoryRow } from '../../pages/categories/components/table/table.types';

export type CategoryType = 'despesa' | 'receita';

@Injectable({ providedIn: 'root' })
export class CategoriesDataService {
  getRows(type: CategoryType): CategoryRow[] {
    if (type === 'receita') {
      return [
        { id: 'income-salary', name: 'Salário', icon: 'payments', color: '#10b780' },
        { id: 'income-freelancer', name: 'Freelancer', icon: 'work', color: '#42a5f5' },
        { id: 'income-investments', name: 'Investimentos', icon: 'trending_up', color: '#7c3aed' },
        { id: 'income-other', name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      ];
    }

    return [
      { id: 'expense-food', name: 'Alimentação', icon: 'restaurant', color: '#ef4444' },
      { id: 'expense-subscription', name: 'Assinatura', icon: 'subscriptions', color: '#a855f7' },
      { id: 'expense-home', name: 'Casa', icon: 'home', color: '#06b6d4' },
      { id: 'expense-shopping', name: 'Compras', icon: 'shopping_bag', color: '#a855f7' },
      { id: 'expense-education', name: 'Educação', icon: 'school', color: '#a855f7' },
      { id: 'expense-leisure', name: 'Lazer', icon: 'sports_esports', color: '#f59e0b' },
      { id: 'expense-bank', name: 'Operação bancária', icon: 'account_balance', color: '#a855f7' },
      { id: 'expense-other', name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      { id: 'expense-pix', name: 'Pix', icon: 'qr_code_2', color: '#a855f7' },
      { id: 'expense-health', name: 'Saúde', icon: 'local_hospital', color: '#84cc16' },
      { id: 'expense-services', name: 'Serviços', icon: 'handyman', color: '#16a34a' },
      { id: 'expense-grocery', name: 'Supermercado', icon: 'shopping_cart', color: '#ef4444' },
      { id: 'expense-transport', name: 'Transporte', icon: 'directions_bus', color: '#2563eb' },
      { id: 'expense-travel', name: 'Viagem', icon: 'flight', color: '#06b6d4' },
    ];
  }
}

