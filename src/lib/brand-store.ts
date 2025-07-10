
import type { BrandInfo } from './types';
import { firestore } from './firebase';

const BRAND_DOC_ID = 'main_brand_info';

export async function getBrandInfo(): Promise<BrandInfo | null> {
  try {
    const doc = await firestore.collection('brand').doc(BRAND_DOC_ID).get();
    if (!doc.exists) {
      console.warn("Brand document not found in Firestore.");
      return null;
    }
    return doc.data() as BrandInfo;
  } catch (error) {
    console.error("Error fetching brand info:", error);
    return null;
  }
}

export async function setBrandInfo(newBrandInfo: BrandInfo): Promise<void> {
  try {
    await firestore.collection('brand').doc(BRAND_DOC_ID).set(newBrandInfo, { merge: true });
  } catch (error) {
    console.error("Error setting brand info:", error);
  }
}
