
import type { MenuItem } from './types';
import { initialMenuItems } from './mock-data';

declare global {
  var menuItemsStore: MenuItem[] | undefined;
}

const getStore = (): MenuItem[] => {
    if (!globalThis.menuItemsStore) {
        globalThis.menuItemsStore = [...initialMenuItems];
    }
    return globalThis.menuItemsStore;
}

// ---- Public API for the Menu Store ----

export function getMenuItems(): MenuItem[] {
  return getStore();
}

export function findMenuItemById(id: string): MenuItem | undefined {
    return getStore().find(item => item.id === id);
}

export function addMenuItemToStore(newItem: MenuItem): void {
  getStore().unshift(newItem);
}

export function updateMenuItemInStore(updatedItem: MenuItem): MenuItem | null {
    const store = getStore();
    const index = store.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedItem;
    return updatedItem;
}

export function deleteMenuItemFromStore(itemId: string): boolean {
    const store = getStore();
    const index = store.findIndex(item => item.id === itemId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    return true;
}
