
import type { Review } from './types';
import { firestore } from './firebase';

const reviewsCollection = firestore.collection('reviews');

export async function getReviews(): Promise<Review[]> {
  try {
    const snapshot = await reviewsCollection.get();
    return snapshot.docs.map(doc => doc.data() as Review);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function addReviewToStore(newReview: Review): Promise<void> {
  try {
    await reviewsCollection.doc(newReview.id).set(newReview);
  } catch (error) {
    console.error("Error adding review:", error);
  }
}

export async function updateReviewInStore(updatedReview: Review): Promise<Review | null> {
  try {
    await reviewsCollection.doc(updatedReview.id).set(updatedReview, { merge: true });
    return updatedReview;
  } catch (error) {
    console.error(`Error updating review ${updatedReview.id}:`, error);
    return null;
  }
}

export async function deleteReviewFromStore(reviewId: string): Promise<boolean> {
  try {
    await reviewsCollection.doc(reviewId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    return false;
  }
}
