
import type { MenuItem } from './types';

declare global {
  var menuItemsStore: MenuItem[] | undefined;
}

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bruschetta',
    description: 'Toasted bread with tomatoes, garlic, and basil.',
    price: 8.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'bruschetta appetizer',
    category: 'Appetizers',
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '2',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, and basil.',
    price: 10.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'caprese salad',
    category: 'Appetizers',
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and pepper.',
    price: 15.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'spaghetti carbonara',
    category: 'Main Courses',
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomatoes, mozzarella, and basil.',
    price: 14.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'margherita pizza',
    category: 'Main Courses',
    isAvailable: true,
    isFeatured: true,
  },
    {
    id: '5',
    name: 'Grilled Salmon',
    description: 'Served with asparagus and lemon butter sauce.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'grilled salmon',
    category: 'Main Courses',
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Tiramisu',
    description: 'Coffee-flavored Italian dessert.',
    price: 7.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'tiramisu dessert',
    category: 'Desserts',
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '7',
    name: 'Panna Cotta',
    description: 'Sweetened cream thickened with gelatin.',
    price: 6.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'panna cotta',
    category: 'Desserts',
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '8',
    name: 'Mineral Water',
    description: 'Still or sparkling water.',
    price: 3.00,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'water bottle',
    category: 'Drinks',
    isAvailable: true,
    isFeatured: false,
  },
    {
    id: '9',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice.',
    price: 5.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'orange juice',
    category: 'Drinks',
    isAvailable: true,
    isFeatured: false,
  },
];

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
