
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useAuth } from './auth';

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  reorder: (items: CartItem[]) => void;
  addMultipleItems: (items: MenuItem[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'culina-preorder-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser } = useAuth();

  const getCartStorageKey = useCallback(() => {
    if (currentUser) {
      return `${LOCAL_STORAGE_KEY_PREFIX}-${currentUser.id}`;
    }
    return `${LOCAL_STORAGE_KEY_PREFIX}-guest`;
  }, [currentUser]);
  
  // Load cart from localStorage when the user changes (login/logout)
  useEffect(() => {
    try {
      const storageKey = getCartStorageKey();
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        setItems(JSON.parse(item));
      } else {
        // If there's no cart for this user, clear the current items
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
      setItems([]);
    }
  }, [currentUser, getCartStorageKey]);
  
  // Save cart to localStorage whenever items or the user changes
  useEffect(() => {
    try {
      const storageKey = getCartStorageKey();
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [items, getCartStorageKey]);

  const addItem = (itemToAdd: MenuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    toast({
        title: "Added to cart",
        description: `${itemToAdd.name} is now in your cart.`,
    })
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
     toast({
        title: "Item removed",
        description: `The item has been removed from your cart.`,
    })
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };
  
  const reorder = (itemsToReorder: CartItem[]) => {
    setItems(itemsToReorder);
    toast({
      title: "Items Added to Cart",
      description: "The order items have been added to your cart for reordering.",
    });
    router.push('/checkout');
  };

  const addMultipleItems = (itemsToAdd: MenuItem[]) => {
    setItems(prevItems => {
        const newItems = [...prevItems];
        itemsToAdd.forEach(itemToAdd => {
            if (itemToAdd.isAvailable) {
                const existingItem = newItems.find(item => item.id === itemToAdd.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    newItems.push({ ...itemToAdd, quantity: 1 });
                }
            }
        });
        return newItems;
    });
    toast({
        title: "Favorites Added",
        description: `Available items from your favorites have been added to your cart.`,
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, reorder, addMultipleItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
