
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MenuItem } from '@/lib/types';
import { menuItems as mockMenuItems } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type MenuContextType = {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'aiHint' | 'isAvailable' | 'isFeatured'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-menu';

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setMenuItems(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load menu from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(menuItems));
    } catch (error) {
      console.error("Failed to save menu to localStorage", error);
    }
  }, [menuItems]);

  const addMenuItem = useCallback((itemData: Omit<MenuItem, 'id' | 'aiHint' | 'isAvailable' | 'isFeatured'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `MENU-${Date.now()}`,
      aiHint: itemData.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
    };
    setMenuItems(prevItems => [newItem, ...prevItems]);
    toast({
      title: "Menu Item Added",
      description: `${newItem.name} has been added to the menu.`,
    });
  }, [toast]);

  const updateMenuItem = useCallback((itemData: MenuItem) => {
    setMenuItems(prevItems =>
      prevItems.map(item => (item.id === itemData.id ? itemData : item))
    );
    toast({
      title: "Menu Item Updated",
      description: `${itemData.name} has been updated.`,
    });
  }, [toast]);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Menu Item Deleted",
      description: `The item has been removed from the menu.`,
    });
  }, [toast]);

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, deleteMenuItem }}>
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
