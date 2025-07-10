
import reviewsData from '../../data/reviews.json';
import type { Review } from './types';

// NOTE: In a real app, this would fetch from a database.
// For this prototype, we are reading directly from a JSON file.

export function getReviews(): Review[] {
  return reviewsData as Review[];
}
