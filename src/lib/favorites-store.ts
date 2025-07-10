
import { firestore } from './firebase';

type UserFavorites = {
    itemIds: string[];
    orderIds: string[];
};

const favoritesCollection = firestore.collection('favorites');

export async function getFavorites(userId: string): Promise<UserFavorites> {
    try {
        const doc = await favoritesCollection.doc(userId).get();
        if (doc.exists) {
            return doc.data() as UserFavorites;
        }
        return { itemIds: [], orderIds: [] };
    } catch (error) {
        console.error(`Error fetching favorites for user ${userId}:`, error);
        return { itemIds: [], orderIds: [] };
    }
}

export async function toggleFavorite(userId: string, type: 'item' | 'order', id: string, forceAdd?: boolean): Promise<void> {
    try {
        const docRef = favoritesCollection.doc(userId);
        const doc = await docRef.get();
        const currentFavorites = doc.exists ? doc.data() as UserFavorites : { itemIds: [], orderIds: [] };

        const key = type === 'item' ? 'itemIds' : 'orderIds';
        const idList = currentFavorites[key] || [];
        const isFavorite = idList.includes(id);

        let newList;
        if (forceAdd === true) {
            newList = isFavorite ? idList : [...idList, id];
        } else if (forceAdd === false) {
            newList = isFavorite ? idList.filter(i => i !== id) : idList;
        } else {
            newList = isFavorite ? idList.filter(i => i !== id) : [...idList, id];
        }
        
        await docRef.set({ ...currentFavorites, [key]: newList }, { merge: true });
    } catch (error) {
        console.error(`Error toggling favorite for user ${userId}:`, error);
    }
}
