
import fs from 'fs';
import path from 'path';
import type { MenuItem } from './types';

const dataFilePath = path.join(process.cwd(), 'data/menu.json');
let menuCache: MenuItem[] | null = null;

function getStore(): MenuItem[] {
    if (menuCache) {
        return menuCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        menuCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
             console.error(`Error: Menu data file not found at ${dataFilePath}. Please ensure it exists.`);
            return [];
        }
        throw error;
    }
}

function saveStore(data: MenuItem[]): void {
    menuCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Public API for the Menu Store ----

export function getMenuItems(): MenuItem[] {
  return getStore();
}

export function findMenuItemById(id: string): MenuItem | undefined {
    return getStore().find(item => item.id === id);
}

export function addMenuItemToStore(newItem: MenuItem): void {
  const store = getStore();
  store.unshift(newItem);
  saveStore(store);
}

export function updateMenuItemInStore(updatedItem: MenuItem): MenuItem | null {
    const store = getStore();
    const index = store.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
        return null;
    }
    store[index] = updatedItem;
    saveStore(store);
    return updatedItem;
}

export function deleteMenuItemFromStore(itemId: string): boolean {
    const store = getStore();
    const index = store.findIndex(item => item.id === itemId);
    if (index === -1) {
        return false;
    }
    store.splice(index, 1);
    saveStore(store);
    return true;
}
