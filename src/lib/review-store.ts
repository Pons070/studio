
import type { Review } from './types';

declare global {
  var reviewsStore: Review[] | undefined;
}

const initialReviews: Review[] = [
  {
    id: 'REV-001',
    orderId: 'ORD-001',
    customerName: 'Alice',
    rating: 5,
    comment: 'The Spaghetti Carbonara was absolutely divine! Best I have ever had. Will be ordering again soon!',
    date: '2023-10-27',
    adminReply: 'Thank you so much, Alice! We are thrilled you enjoyed it and look forward to serving you again.',
    isPublished: true,
  },
  {
    id: 'REV-002',
    orderId: 'ORD-005',
    customerName: 'Bob',
    rating: 4,
    comment: 'Great pizza and the Caprese salad was very fresh. The pickup process was quick and easy. Would recommend.',
    date: '2024-02-11',
    isPublished: true,
  },
  {
    id: 'REV-003',
    orderId: 'ORD-003',
    customerName: 'Charlie',
    rating: 5,
    comment: 'Delicious food and excellent service. The pre-order system is so convenient!',
    date: '2023-12-02',
    isPublished: true,
  },
    {
    id: 'REV-004',
    orderId: 'ORD-002',
    customerName: 'Diana',
    rating: 4,
    comment: 'The food was amazing, as always. A bit of a wait during pickup, but it was a busy night. Overall, a great experience.',
    date: '2023-11-16',
    adminReply: 'Thank you for your feedback, Diana! We apologize for the delay and are working to improve our pickup times during peak hours.',
    isPublished: true,
  },
  {
    id: 'REV-005',
    orderId: 'ORD-004',
    customerName: 'Eve',
    rating: 3,
    comment: 'Food was decent, but my order was slightly delayed. The staff was apologetic and friendly.',
    date: '2024-01-06',
    isPublished: false,
  }
];

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
