
import { initialFavorites } from './mock-data';

type UserFavorites = {
    itemIds: string[];
    orderIds: string[];
};

type FavoritesStore = Record<string, UserFavorites>;

const favoritesStore: FavoritesStore = { ...initialFavorites };

// ---- Public API for the Favorites Store ----

export function getFavorites(userId: string): UserFavorites {
    if (!favoritesStore[userId]) {
        favoritesStore[userId] = { itemIds: [], orderIds: [] };
    }
    return favoritesStore[userId];
}

export function toggleFavorite(userId: string, type: 'item' | 'order', id: string, forceAdd?: boolean): void {
    if (!favoritesStore[userId]) {
        favoritesStore[userId] = { itemIds: [], orderIds: [] };
    }
    
    const idList = type === 'item' ? favoritesStore[userId].itemIds : favoritesStore[userId].orderIds;
    const isFavorite = idList.includes(id);

    if (forceAdd === true) {
        if (!isFavorite) idList.push(id);
    } else if (forceAdd === false) {
        if (isFavorite) {
            const index = idList.indexOf(id);
            idList.splice(index, 1);
        }
    } else { // Toggle
        if (isFavorite) {
            const index = idList.indexOf(id);
            idList.splice(index, 1);
        } else {
            idList.push(id);
        }
    }
}
