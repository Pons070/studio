
import fs from 'fs';
import path from 'path';

type UserFavorites = {
    itemIds: string[];
    orderIds: string[];
};

type AllFavorites = {
    [userId: string]: UserFavorites;
}

const dataFilePath = path.join(process.cwd(), 'data/favorites.json');

function getAllFavorites(): AllFavorites {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function saveAllFavorites(data: AllFavorites): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getFavorites(userId: string): UserFavorites {
    const allFavorites = getAllFavorites();
    return allFavorites[userId] || { itemIds: [], orderIds: [] };
}

export function toggleFavorite(userId: string, type: 'item' | 'order', id: string, forceAdd?: boolean): void {
    const allFavorites = getAllFavorites();
    const userFavorites = allFavorites[userId] || { itemIds: [], orderIds: [] };
    
    const key = type === 'item' ? 'itemIds' : 'orderIds';
    const idList = userFavorites[key] || [];
    const isFavorite = idList.includes(id);

    let newList;
    if (forceAdd === true) {
        newList = isFavorite ? idList : [...idList, id];
    } else if (forceAdd === false) {
        newList = isFavorite ? idList.filter(i => i !== id) : idList;
    } else {
        newList = isFavorite ? idList.filter(i => i !== id) : [...idList, id];
    }
    
    allFavorites[userId] = {
        ...userFavorites,
        [key]: newList
    };

    saveAllFavorites(allFavorites);
}
