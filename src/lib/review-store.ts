
import fs from 'fs';
import path from 'path';
import type { Review } from './types';

const dataFilePath = path.join(process.cwd(), 'data/reviews.json');

function readData(): Review[] {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: Review[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getReviews(): Review[] {
  return readData();
}

export function addReviewToStore(newReview: Review): void {
  const reviews = readData();
  reviews.push(newReview);
  writeData(reviews);
}

export function updateReviewInStore(updatedReview: Review): Review | null {
  const reviews = readData();
  const index = reviews.findIndex(review => review.id === updatedReview.id);
  if (index !== -1) {
    reviews[index] = updatedReview;
    writeData(reviews);
    return updatedReview;
  }
  return null;
}

export function deleteReviewFromStore(reviewId: string): boolean {
  let reviews = readData();
  const initialLength = reviews.length;
  reviews = reviews.filter(review => review.id !== reviewId);
  if (reviews.length < initialLength) {
    writeData(reviews);
    return true;
  }
  return false;
}
