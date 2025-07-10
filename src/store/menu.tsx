
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { MenuItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { addMenuItemToStore, deleteMenuItemFromStore, getMenuItems, updateMenuItemInStore } from '@/lib/menu-store';

type MenuContextType = {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'aiHint' | 'isAvailable' | 'isFeatured'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  isLoading: boolean;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getMenuItems());
  const { toast } = useToast();

  const addMenuItem = useCallback(async (itemData: Omit<MenuItem, 'id'| 'aiHint' | 'isAvailable' | 'isFeatured'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `ITEM-${Date.now()}`,
      aiHint: itemData.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: itemData.imageUrl || 'https://placehold.co/600x400.png',
    };
    addMenuItemToStore(newItem);
    setMenuItems(getMenuItems());
    toast({ title: "Menu Item Added", description: `${newItem.name} has been added to the menu.` });
  }, [toast]);

  const updateMenuItem = useCallback(async (itemData: MenuItem) => {
    updateMenuItemInStore(itemData);
    setMenuItems(getMenuItems());
    toast({ title: "Menu Item Updated", description: `${itemData.name} has been updated.` });
  }, [toast]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    deleteMenuItemFromStore(itemId);
    setMenuItems(getMenuItems());
    toast({ title: "Menu Item Deleted", description: `The item has been removed from the menu.` });
  }, [toast]);

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, deleteMenuItem, isLoading: false }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
