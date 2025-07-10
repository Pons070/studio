
import type { MenuItem } from './types';
import { firestore } from './firebase';

const menuCollection = firestore.collection('menu');

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const snapshot = await menuCollection.get();
    return snapshot.docs.map(doc => doc.data() as MenuItem);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export async function findMenuItemById(id: string): Promise<MenuItem | undefined> {
  try {
    const doc = await menuCollection.doc(id).get();
    return doc.exists ? doc.data() as MenuItem : undefined;
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    return undefined;
  }
}

export async function addMenuItemToStore(newItem: MenuItem): Promise<void> {
  try {
    await menuCollection.doc(newItem.id).set(newItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
  }
}

export async function updateMenuItemInStore(updatedItem: MenuItem): Promise<MenuItem | null> {
  try {
    await menuCollection.doc(updatedItem.id).set(updatedItem, { merge: true });
    return updatedItem;
  } catch (error) {
    console.error(`Error updating menu item ${updatedItem.id}:`, error);
    return null;
  }
}

export async function deleteMenuItemFromStore(itemId: string): Promise<boolean> {
  try {
    await menuCollection.doc(itemId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting menu item ${itemId}:`, error);
    return false;
  }
}
