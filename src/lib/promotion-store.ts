
import type { Promotion } from './types';
import { initialPromotions } from './mock-data';

declare global {
  var promotionsStore: Promotion[] | undefined;
}

const getStore = (): Promotion[] => {
    if (!globalThis.promotionsStore) {
        globalThis.promotionsStore = [...initialPromotions];
    }
    return globalThis.promotionsStore;
}

// ---- Public API for the Promotion Store ----

export function getPromotions(): Promotion[] {
  return getStore();
}

export function addPromotionToStore(newPromotion: Promotion): void {
  getStore().unshift(newPromotion);
}

export function updatePromotionInStore(updatedPromotion: Promotion): Promotion | null {
    const store = getStore();
    const index = store.findIndex(p => p.id === updatedPromotion.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedPromotion;
    return updatedPromotion;
}

export function deletePromotionFromStore(promotionId: string): boolean {
    const store = getStore();
    const index = store.findIndex(p => p.id === promotionId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    return true;
}
