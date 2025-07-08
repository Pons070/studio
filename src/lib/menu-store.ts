
import { initialMenuItems } from './mock-data';
import type { MenuItem } from './types';

let menuItems: MenuItem[] = [...initialMenuItems];

// ---- Public API for the Menu Store ----

export function getMenuItems(): MenuItem[] {
  return menuItems;
}

export function findMenuItemById(id: string): MenuItem | undefined {
    return menuItems.find(item => item.id === id);
}

export function addMenuItemToStore(newItem: MenuItem): void {
  menuItems.unshift(newItem);
}

export function updateMenuItemInStore(updatedItem: MenuItem): MenuItem | null {
    const index = menuItems.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
        return null;
    }
    menuItems[index] = updatedItem;
    return updatedItem;
}

export function deleteMenuItemFromStore(itemId: string): boolean {
    const index = menuItems.findIndex(item => item.id === itemId);
    if (index === -1) {
        return false;
    }
    menuItems.splice(index, 1);
    return true;
}
