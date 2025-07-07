
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

const LOCAL_STORAGE_KEY = 'culina-preorder-menu'; 

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadMenu() {
        setIsLoading(true);
        try {
            const cachedItems = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cachedItems) {
                setMenuItems(JSON.parse(cachedItems));
            }

            const response = await fetch('/api/menu');
            const data = await response.json();
            
            if (data.success) {
                setMenuItems(data.menuItems);
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.menuItems));
            } else {
                 if (!cachedItems) {
                    toast({ title: 'Error', description: 'Could not fetch the latest menu.', variant: 'destructive' });
                 }
            }
        } catch (error) {
             console.error("Failed to fetch menu from API", error);
             if (!window.localStorage.getItem(LOCAL_STORAGE_KEY)) {
                toast({ title: 'Network Error', description: 'Could not connect to the server.', variant: 'destructive' });
             }
        } finally {
            setIsLoading(false);
        }
    }
    loadMenu();
  }, [toast]);
  
  useEffect(() => {
    if (!isLoading) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(menuItems));
    }
  }, [menuItems, isLoading]);

  const addMenuItem = useCallback(async (itemData: Omit<MenuItem, 'id'| 'aiHint' | 'isAvailable' | 'isFeatured'>) => {
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to add menu item.", variant: "destructive" });
            return;
        }

        const newItem: MenuItem = result.menuItem;
        setMenuItems(prevItems => [newItem, ...prevItems]);
        toast({ title: "Menu Item Added", description: `${newItem.name} has been added to the menu.` });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to add item.', variant: 'destructive' });
    }
  }, [toast]);

  const updateMenuItem = useCallback(async (itemData: MenuItem) => {
     try {
        const response = await fetch('/api/menu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to update menu item.", variant: "destructive" });
            return;
        }

        const updatedItem: MenuItem = result.menuItem;
        setMenuItems(prevItems =>
          prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
        );
        toast({ title: "Menu Item Updated", description: `${updatedItem.name} has been updated.` });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to update item.', variant: 'destructive' });
    }
  }, [toast]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    try {
        const response = await fetch('/api/menu', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to delete menu item.", variant: "destructive" });
            return;
        }

        setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
        toast({ title: "Menu Item Deleted", description: `The item has been removed from the menu.` });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to delete item.', variant: 'destructive' });
    }
  }, [toast]);

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
