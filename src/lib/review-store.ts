
import { initialReviews } from './mock-data';
import type { Review } from './types';

let reviews: Review[] = [...initialReviews];

// ---- Public API for the Review Store ----

export function getReviews(): Review[] {
  return reviews;
}

export function addReviewToStore(newReview: Review): void {
  reviews.unshift(newReview);
}

export function updateReviewInStore(updatedReview: Review): Review | null {
    const index = reviews.findIndex(r => r.id === updatedReview.id);
    if (index === -1) {
        return null;
    }
    reviews[index] = updatedReview;
    return updatedReview;
}

export function deleteReviewFromStore(reviewId: string): boolean {
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index === -1) {
        return false;
    }
    reviews.splice(index, 1);
    return true;
}
