
import { initialPromotions } from './mock-data';
import type { Promotion } from './types';

let promotions: Promotion[] = [...initialPromotions];

// ---- Public API for the Promotion Store ----

export function getPromotions(): Promotion[] {
  return promotions;
}

export function addPromotionToStore(newPromotion: Promotion): void {
  promotions.unshift(newPromotion);
}

export function updatePromotionInStore(updatedPromotion: Promotion): Promotion | null {
    const index = promotions.findIndex(p => p.id === updatedPromotion.id);
    if (index === -1) {
        return null;
    }
    promotions[index] = updatedPromotion;
    return updatedPromotion;
}

export function deletePromotionFromStore(promotionId: string): boolean {
    const index = promotions.findIndex(p => p.id === promotionId);
    if (index === -1) {
        return false;
    }
    promotions.splice(index, 1);
    return true;
}
