
import fs from 'fs';
import path from 'path';
import type { Promotion } from './types';

const dataFilePath = path.join(process.cwd(), 'data/promotions.json');

function readData(): Promotion[] {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: Promotion[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getPromotions(): Promotion[] {
  return readData();
}

export function addPromotionToStore(newPromotion: Promotion): void {
  const promotions = readData();
  promotions.push(newPromotion);
  writeData(promotions);
}

export function updatePromotionInStore(updatedPromotion: Promotion): Promotion | null {
  const promotions = readData();
  const index = promotions.findIndex(promo => promo.id === updatedPromotion.id);
  if (index !== -1) {
    promotions[index] = updatedPromotion;
    writeData(promotions);
    return updatedPromotion;
  }
  return null;
}

export function deletePromotionFromStore(promotionId: string): boolean {
  let promotions = readData();
  const initialLength = promotions.length;
  promotions = promotions.filter(promo => promo.id !== promotionId);
  if (promotions.length < initialLength) {
    writeData(promotions);
    return true;
  }
  return false;
}
