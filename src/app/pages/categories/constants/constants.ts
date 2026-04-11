import type { EditCategoryModalData } from '../components/modal/modal.component';

export const DEFAULT_CATEGORY_ICON = 'restaurant';

export const DEFAULT_CATEGORY_COLOR_HEX = '#ef4444';

export const NEW_CATEGORY_MODAL_TITLE = 'Nova categoria';

export function newCategoryModalData(): EditCategoryModalData {
  return {
    name: '',
    title: NEW_CATEGORY_MODAL_TITLE,
    icon: DEFAULT_CATEGORY_ICON,
    color: DEFAULT_CATEGORY_COLOR_HEX,
  };
}

export function createCategoryRowId(): string {
  return `category-${crypto.randomUUID()}`;
}
