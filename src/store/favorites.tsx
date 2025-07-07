
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
        // First, try loading from localStorage for speed
        try {
            const item = window.localStorage.getItem(storageKey);
            if (item) {
            const { itemIds, orderIds } = JSON.parse(item);
            setFavoriteItemIds(itemIds || []);
            setFavoriteOrderIds(orderIds || []);
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
        }
        
        // Then, simulate fetching from API to demonstrate pattern
        if (currentUser?.id) {
            fetch(`/api/favorites?userId=${currentUser.id}`)
                .then(res => res.json())
                .then(data => {
                if(data.success) {
                    // In a real app, you might merge client and server state here.
                    // For this prototype, we do nothing with the response as localStorage is king.
                    console.log("Simulated fetch for favorites complete.");
                }
                })
                .catch(err => console.error("Could not fetch favorites", err));
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

  const toggleFavoriteItem = useCallback(async (itemId: string) => {
    if (!isAuthenticated || !currentUser) {
        toast({ title: "Please log in to add favorites.", variant: "destructive" });
        return;
    }
    const isFavorite = favoriteItemIds.includes(itemId);
    
    try {
        const response = await fetch('/api/favorites', {
            method: isFavorite ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, type: 'item', id: itemId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to update favorites.", variant: "destructive" });
            return;
        }

        let newFavoriteItemIds;
        if (isFavorite) {
          newFavoriteItemIds = favoriteItemIds.filter(id => id !== itemId);
          toast({ title: "Removed from Favorites" });
        } else {
          newFavoriteItemIds = [...favoriteItemIds, itemId];
          toast({ title: "Added to Favorites" });
        }
        setFavoriteItemIds(newFavoriteItemIds);
        persistFavorites(newFavoriteItemIds, favoriteOrderIds);

    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to update favorites.', variant: 'destructive' });
    }
  }, [favoriteItemIds, favoriteOrderIds, persistFavorites, toast, isAuthenticated, currentUser]);

  const toggleFavoriteOrder = useCallback(async (orderId: string) => {
     if (!isAuthenticated || !currentUser) {
        toast({ title: "Please log in to add favorites.", variant: "destructive" });
        return;
    }
    const isFavorite = favoriteOrderIds.includes(orderId);

    try {
        const response = await fetch('/api/favorites', {
            method: isFavorite ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, type: 'order', id: orderId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to update favorites.", variant: "destructive" });
            return;
        }
        
        let newFavoriteOrderIds;
        if (isFavorite) {
          newFavoriteOrderIds = favoriteOrderIds.filter(id => id !== orderId);
          toast({ title: "Removed from Favorite Orders" });
        } else {
          newFavoriteOrderIds = [...favoriteOrderIds, orderId];
          toast({ title: "Added to Favorite Orders" });
        }
        setFavoriteOrderIds(newFavoriteOrderIds);
        persistFavorites(favoriteItemIds, newFavoriteOrderIds);

    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to update favorites.', variant: 'destructive' });
    }
  }, [favoriteOrderIds, favoriteItemIds, persistFavorites, toast, isAuthenticated, currentUser]);

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
