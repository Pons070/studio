
import menuData from '../../data/menu.json';
import type { MenuItem } from './types';

// NOTE: In a real app, this would fetch from a database.
// For this prototype, we are reading directly from a JSON file.

export function getMenuItems(): MenuItem[] {
  return menuData as MenuItem[];
}
