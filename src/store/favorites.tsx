
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth';
import { useToast } from "@/hooks/use-toast";

type FavoritesContextType = {
  favoriteItemIds: string[];
  favoriteOrderIds: string[];
  toggleFavoriteItem: (itemId: string) => void;
  isItemFavorite: (itemId: string) => boolean;
  toggleFavoriteOrder: (orderId: string) => void;
  isOrderFavorite: (orderId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY_PREFIX = 'culina-preorder-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>([]);
  const [favoriteOrderIds, setFavoriteOrderIds] = useState<string[]>([]);
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const getStorageKey = useCallback(() => {
    if (!currentUser) return null;
    return `${FAVORITES_STORAGE_KEY_PREFIX}-${currentUser.id}`;
  }, [currentUser]);
  
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        const item = window.localStorage.getItem(storageKey);
        if (item) {
          const { itemIds, orderIds } = JSON.parse(item);
          setFavoriteItemIds(itemIds || []);
          setFavoriteOrderIds(orderIds || []);
        } else {
            setFavoriteItemIds([]);
            setFavoriteOrderIds([]);
        }
      } catch (error) {
        console.error("Failed to load favorites from localStorage", error);
      }
    } else {
        // Clear favorites when user logs out
        setFavoriteItemIds([]);
        setFavoriteOrderIds([]);
    }
  }, [currentUser, getStorageKey]);

  const persistFavorites = useCallback((itemIds: string[], orderIds: string[]) => {
    const storageKey = getStorageKey();
    if (storageKey) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({ itemIds, orderIds }));
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }
  }, [getStorageKey]);

  const toggleFavoriteItem = useCallback((itemId: string) => {
    if (!isAuthenticated) {
        toast({ title: "Please log in to add favorites.", variant: "destructive" });
        return;
    }
    let newFavoriteItemIds;
    const isFavorite = favoriteItemIds.includes(itemId);
    if (isFavorite) {
      newFavoriteItemIds = favoriteItemIds.filter(id => id !== itemId);
      toast({ title: "Removed from Favorites" });
    } else {
      newFavoriteItemIds = [...favoriteItemIds, itemId];
      toast({ title: "Added to Favorites" });
    }
    setFavoriteItemIds(newFavoriteItemIds);
    persistFavorites(newFavoriteItemIds, favoriteOrderIds);
  }, [favoriteItemIds, favoriteOrderIds, persistFavorites, toast, isAuthenticated]);

  const toggleFavoriteOrder = useCallback((orderId: string) => {
     if (!isAuthenticated) {
        toast({ title: "Please log in to add favorites.", variant: "destructive" });
        return;
    }
    let newFavoriteOrderIds;
    const isFavorite = favoriteOrderIds.includes(orderId);
    if (isFavorite) {
      newFavoriteOrderIds = favoriteOrderIds.filter(id => id !== orderId);
      toast({ title: "Removed from Favorite Orders" });
    } else {
      newFavoriteOrderIds = [...favoriteOrderIds, orderId];
      toast({ title: "Added to Favorite Orders" });
    }
    setFavoriteOrderIds(newFavoriteOrderIds);
    persistFavorites(favoriteItemIds, newFavoriteOrderIds);
  }, [favoriteOrderIds, favoriteItemIds, persistFavorites, toast, isAuthenticated]);

  const isItemFavorite = useCallback((itemId: string) => {
    return favoriteItemIds.includes(itemId);
  }, [favoriteItemIds]);
  
  const isOrderFavorite = useCallback((orderId: string) => {
    return favoriteOrderIds.includes(orderId);
  }, [favoriteOrderIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteItemIds, favoriteOrderIds, toggleFavoriteItem, isItemFavorite, toggleFavoriteOrder, isOrderFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
