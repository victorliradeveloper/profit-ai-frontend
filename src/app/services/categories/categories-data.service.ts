import { Injectable } from '@angular/core';
import { CategoryRow } from '../../pages/categories/components/table/table.types';

export type CategoryType = 'despesa' | 'receita';

@Injectable({ providedIn: 'root' })
export class CategoriesDataService {
  getRows(type: CategoryType): CategoryRow[] {
    if (type === 'receita') {
      return [
        { name: 'Salário', icon: 'payments', color: '#10b780' },
        { name: 'Freelancer', icon: 'work', color: '#42a5f5' },
        { name: 'Investimentos', icon: 'trending_up', color: '#7c3aed' },
        { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      ];
    }

    return [
      { name: 'Alimentação', icon: 'restaurant', color: '#ef4444' },
      { name: 'Assinatura', icon: 'subscriptions', color: '#a855f7' },
      { name: 'Casa', icon: 'home', color: '#06b6d4' },
      { name: 'Compras', icon: 'shopping_bag', color: '#a855f7' },
      { name: 'Educação', icon: 'school', color: '#a855f7' },
      { name: 'Lazer', icon: 'sports_esports', color: '#f59e0b' },
      { name: 'Operação bancária', icon: 'account_balance', color: '#a855f7' },
      { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
      { name: 'Pix', icon: 'qr_code_2', color: '#a855f7' },
      { name: 'Saúde', icon: 'local_hospital', color: '#84cc16' },
      { name: 'Serviços', icon: 'handyman', color: '#16a34a' },
      { name: 'Supermercado', icon: 'shopping_cart', color: '#ef4444' },
      { name: 'Transporte', icon: 'directions_bus', color: '#2563eb' },
      { name: 'Viagem', icon: 'flight', color: '#06b6d4' },
    ];
  }
}

