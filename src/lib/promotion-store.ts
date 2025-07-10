
import type { Promotion } from './types';
import { firestore } from './firebase';

const promotionsCollection = firestore.collection('promotions');

export async function getPromotions(): Promise<Promotion[]> {
  try {
    const snapshot = await promotionsCollection.get();
    return snapshot.docs.map(doc => doc.data() as Promotion);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

export async function addPromotionToStore(newPromotion: Promotion): Promise<void> {
  try {
    await promotionsCollection.doc(newPromotion.id).set(newPromotion);
  } catch (error) {
    console.error("Error adding promotion:", error);
  }
}

export async function updatePromotionInStore(updatedPromotion: Promotion): Promise<Promotion | null> {
  try {
    await promotionsCollection.doc(updatedPromotion.id).set(updatedPromotion, { merge: true });
    return updatedPromotion;
  } catch (error) {
    console.error(`Error updating promotion ${updatedPromotion.id}:`, error);
    return null;
  }
}

export async function deletePromotionFromStore(promotionId: string): Promise<boolean> {
  try {
    await promotionsCollection.doc(promotionId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting promotion ${promotionId}:`, error);
    return false;
  }
}
