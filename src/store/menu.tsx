
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MenuItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type MenuContextType = {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'aiHint' | 'isAvailable' | 'isFeatured'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  isLoading: boolean;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error("Failed to fetch menu");
      const data = await response.json();
      setMenuItems(data.menuItems);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const addMenuItem = useCallback(async (itemData: Omit<MenuItem, 'id'| 'aiHint' | 'isAvailable' | 'isFeatured'>) => {
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to add item');
        fetchMenu();
        toast({ title: "Menu Item Added", description: `${itemData.name} has been added to the menu.` });
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchMenu]);

  const updateMenuItem = useCallback(async (itemData: MenuItem) => {
    try {
        const response = await fetch('/api/menu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to update item');
        fetchMenu();
        toast({ title: "Menu Item Updated", description: `${itemData.name} has been updated.` });
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchMenu]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    try {
        const response = await fetch('/api/menu', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId }),
        });
        if (!response.ok) throw new Error('Failed to delete item');
        fetchMenu();
        toast({ title: "Menu Item Deleted", description: `The item has been removed from the menu.` });
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchMenu]);

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, deleteMenuItem, isLoading }}>
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

