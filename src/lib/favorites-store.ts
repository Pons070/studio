
type UserFavorites = {
    itemIds: string[];
    orderIds: string[];
};

declare global {
  var favoritesStore: Record<string, UserFavorites> | undefined;
}

const getStore = (): Record<string, UserFavorites> => {
    if (!globalThis.favoritesStore) {
        globalThis.favoritesStore = {};
    }
    return globalThis.favoritesStore;
}

// ---- Public API for the Favorites Store ----

export function getFavorites(userId: string): UserFavorites {
    const store = getStore();
    if (!store[userId]) {
        store[userId] = { itemIds: [], orderIds: [] };
    }
    return store[userId];
}

export function toggleFavorite(userId: string, type: 'item' | 'order', id: string, forceAdd?: boolean): void {
    const userFavorites = getFavorites(userId);
    const idList = type === 'item' ? userFavorites.itemIds : userFavorites.orderIds;

    const isFavorite = idList.includes(id);

    if (forceAdd === true) {
        if (!isFavorite) {
            idList.push(id);
        }
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
