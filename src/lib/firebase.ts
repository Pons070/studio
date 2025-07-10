
import * as admin from 'firebase-admin';
import brandData from '../../data/brand.json';
import favoritesData from '../../data/favorites.json';
import menuData from '../../data/menu.json';
import ordersData from '../../data/orders.json';
import promotionsData from '../../data/promotions.json';
import reviewsData from '../../data/reviews.json';
import usersData from '../../data/users.json';

const dataToSeed: { [key: string]: any[] } = {
  brand: [brandData],
  favorites: Object.entries(favoritesData).map(([id, data]) => ({ id, ...(data as any) })),
  menu: menuData,
  orders: ordersData,
  promotions: promotionsData,
  reviews: reviewsData,
  users: usersData,
};


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

async function seedCollection(collectionName: string, data: any[]) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();

    if (snapshot.empty) {
        console.log(`Seeding '${collectionName}' collection...`);
        const batch = db.batch();
        data.forEach(item => {
            const docRef = collectionRef.doc(item.id || undefined);
            batch.set(docRef, item);
        });
        await batch.commit();
        console.log(`'${collectionName}' collection seeded.`);
    }
}

async function seedDatabase() {
  if (process.env.NODE_ENV === 'development') {
    for (const [collectionName, data] of Object.entries(dataToSeed)) {
      await seedCollection(collectionName, data);
    }
  }
}

seedDatabase().catch(console.error);

export const firestore = db;

