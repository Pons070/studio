
import type { Review } from './types';
import { initialReviews } from './mock-data';

declare global {
  var reviewsStore: Review[] | undefined;
}

const getStore = (): Review[] => {
    if (!globalThis.reviewsStore) {
        globalThis.reviewsStore = [...initialReviews];
    }
    return globalThis.reviewsStore;
}

// ---- Public API for the Review Store ----

export function getReviews(): Review[] {
  return getStore();
}

export function addReviewToStore(newReview: Review): void {
  getStore().unshift(newReview);
}

export function updateReviewInStore(updatedReview: Review): Review | null {
    const store = getStore();
    const index = store.findIndex(r => r.id === updatedReview.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedReview;
    return updatedReview;
}

export function deleteReviewFromStore(reviewId: string): boolean {
    const store = getStore();
    const index = store.findIndex(r => r.id === reviewId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    return true;
}
