
import fs from 'fs';
import path from 'path';
import type { MenuItem } from './types';

const dataFilePath = path.join(process.cwd(), 'data/menu.json');

function readData(): MenuItem[] {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: MenuItem[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getMenuItems(): MenuItem[] {
  return readData();
}

export function addMenuItemToStore(newItem: MenuItem): void {
  const items = readData();
  items.push(newItem);
  writeData(items);
}

export function updateMenuItemInStore(updatedItem: MenuItem): MenuItem | null {
  const items = readData();
  const index = items.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    writeData(items);
    return updatedItem;
  }
  return null;
}

export function deleteMenuItemFromStore(itemId: string): boolean {
  let items = readData();
  const initialLength = items.length;
  items = items.filter(item => item.id !== itemId);
  if (items.length < initialLength) {
    writeData(items);
    return true;
  }
  return false;
}
