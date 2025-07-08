
import fs from 'fs';
import path from 'path';
import type { Promotion } from './types';

const dataFilePath = path.join(process.cwd(), 'data/promotions.json');
let promotionsCache: Promotion[] | null = null;

function getStore(): Promotion[] {
    if (promotionsCache) {
        return promotionsCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        promotionsCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Error: Promotions data file not found at ${dataFilePath}. Please ensure it exists.`);
            return [];
        }
        throw error;
    }
}

function saveStore(data: Promotion[]): void {
    promotionsCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Public API for the Promotion Store ----

export function getPromotions(): Promotion[] {
  return getStore();
}

export function addPromotionToStore(newPromotion: Promotion): void {
  const store = getStore();
  store.unshift(newPromotion);
  saveStore(store);
}

export function updatePromotionInStore(updatedPromotion: Promotion): Promotion | null {
    const store = getStore();
    const index = store.findIndex(p => p.id === updatedPromotion.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedPromotion;
    saveStore(store);
    return updatedPromotion;
}

export function deletePromotionFromStore(promotionId: string): boolean {
    const store = getStore();
    const index = store.findIndex(p => p.id === promotionId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    saveStore(store);
    return true;
}
