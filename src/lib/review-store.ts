
import fs from 'fs';
import path from 'path';
import type { Review } from './types';

const dataFilePath = path.join(process.cwd(), 'data/reviews.json');
let reviewsCache: Review[] | null = null;

function getStore(): Review[] {
    if (reviewsCache) {
        return reviewsCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        reviewsCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Error: Reviews data file not found at ${dataFilePath}. Please ensure it exists.`);
            return [];
        }
        throw error;
    }
}

function saveStore(data: Review[]): void {
    reviewsCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Public API for the Review Store ----

export function getReviews(): Review[] {
  return getStore();
}

export function addReviewToStore(newReview: Review): void {
  const store = getStore();
  store.unshift(newReview);
  saveStore(store);
}

export function updateReviewInStore(updatedReview: Review): Review | null {
    const store = getStore();
    const index = store.findIndex(r => r.id === updatedReview.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedReview;
    saveStore(store);
    return updatedReview;
}

export function deleteReviewFromStore(reviewId: string): boolean {
    const store = getStore();
    const index = store.findIndex(r => r.id === reviewId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    saveStore(store);
    return true;
}
