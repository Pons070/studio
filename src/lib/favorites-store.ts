
import fs from 'fs';
import path from 'path';

type UserFavorites = {
    itemIds: string[];
    orderIds: string[];
};

type FavoritesStore = Record<string, UserFavorites>;

const dataFilePath = path.join(process.cwd(), 'data/favorites.json');
let favoritesCache: FavoritesStore | null = null;

function readStore(): FavoritesStore {
    if (favoritesCache) {
        return favoritesCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        favoritesCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // If file doesn't exist, start with an empty store
            const initialData = {};
            writeStore(initialData);
            favoritesCache = initialData;
            return initialData;
        }
        throw error;
    }
}

function writeStore(data: FavoritesStore): void {
    favoritesCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


// ---- Public API for the Favorites Store ----

export function getFavorites(userId: string): UserFavorites {
    const store = readStore();
    if (!store[userId]) {
        store[userId] = { itemIds: [], orderIds: [] };
    }
    return store[userId];
}

export function toggleFavorite(userId: string, type: 'item' | 'order', id: string, forceAdd?: boolean): void {
    const store = readStore();
    if (!store[userId]) {
        store[userId] = { itemIds: [], orderIds: [] };
    }
    
    const idList = type === 'item' ? store[userId].itemIds : store[userId].orderIds;
    const isFavorite = idList.includes(id);

    let changed = false;
    if (forceAdd === true) {
        if (!isFavorite) {
            idList.push(id);
            changed = true;
        }
    } else if (forceAdd === false) {
        if (isFavorite) {
            const index = idList.indexOf(id);
            idList.splice(index, 1);
            changed = true;
        }
    } else { // Toggle
        if (isFavorite) {
            const index = idList.indexOf(id);
            idList.splice(index, 1);
        } else {
            idList.push(id);
        }
        changed = true;
    }

    if (changed) {
        writeStore(store);
    }
}
