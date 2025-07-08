
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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>([]);
  const [favoriteOrderIds, setFavoriteOrderIds] = useState<string[]>([]);
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadFavorites() {
        if (!isAuthenticated || !currentUser) {
            setFavoriteItemIds([]);
            setFavoriteOrderIds([]);
            return;
        }
        
        try {
            const response = await fetch(`/api/favorites?userId=${currentUser.id}`);
            const data = await response.json();
            if (data.success) {
                setFavoriteItemIds(data.favorites.itemIds || []);
                setFavoriteOrderIds(data.favorites.orderIds || []);
            }
        } catch (error) {
            console.error("Failed to load favorites", error);
        }
    }
    
    if (!isAuthLoading) {
        loadFavorites();
    }
  }, [currentUser, isAuthenticated, isAuthLoading]);

  const toggleFavorite = useCallback(async (id: string, type: 'item' | 'order') => {
    if (!isAuthenticated || !currentUser) {
        toast({ title: "Please log in to add favorites.", variant: "destructive" });
        return;
    }

    const isFavorite = type === 'item' ? favoriteItemIds.includes(id) : favoriteOrderIds.includes(id);
    
    // Optimistic UI update
    if (type === 'item') {
        setFavoriteItemIds(prev => isFavorite ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
        setFavoriteOrderIds(prev => isFavorite ? prev.filter(o => o !== id) : [...prev, id]);
    }

    try {
        const response = await fetch('/api/favorites', {
            method: isFavorite ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, type, id }),
        });

        if (!response.ok) {
            throw new Error('Failed to update favorites');
        }
        
        toast({ title: isFavorite ? "Removed from Favorites" : "Added to Favorites" });

    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update favorites.', variant: 'destructive' });
        // Revert optimistic UI update on failure
        if (type === 'item') {
            setFavoriteItemIds(favoriteItemIds);
        } else {
            setFavoriteOrderIds(favoriteOrderIds);
        }
    }
  }, [isAuthenticated, currentUser, toast, favoriteItemIds, favoriteOrderIds]);

  const toggleFavoriteItem = (itemId: string) => toggleFavorite(itemId, 'item');
  const toggleFavoriteOrder = (orderId: string) => toggleFavorite(orderId, 'order');

  const isItemFavorite = useCallback((itemId: string) => favoriteItemIds.includes(itemId), [favoriteItemIds]);
  const isOrderFavorite = useCallback((orderId: string) => favoriteOrderIds.includes(orderId), [favoriteOrderIds]);

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
