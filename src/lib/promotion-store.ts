
import type { Promotion } from './types';

const initialPromotions: Promotion[] = [
  {
    id: "PROMO-1",
    title: "🎉 Welcome Offer for New Customers!",
    description: "Get 15% off your first order with us. We are so happy to have you!",
    targetAudience: "new",
    isActive: true,
    couponCode: "WELCOME15",
    discountType: "percentage",
    discountValue: 15
  },
  {
    id: "PROMO-2",
    title: "Weekday Special for Regulars!",
    description: "Enjoy a free dessert on us as a thank you for your continued support. Valid on weekdays.",
    targetAudience: "existing",
    isActive: true,
    couponCode: "SWEETTREAT",
    discountType: "flat",
    discountValue: 7.5,
    minOrderValue: 20,
    startDate: "2024-06-01",
    activeDays: [
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    id: "PROMO-3",
    title: "Summer Special - All Customers",
    description: "Get a free drink with any main course ordered this month.",
    targetAudience: "all",
    isActive: false,
    couponCode: "SUMMERDRINK",
    discountType: "flat",
    discountValue: 3,
    startDate: "2023-07-01",
    endDate: "2023-07-31"
  }
];

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
