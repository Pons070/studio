
import type { User } from './types';
import { firestore } from './firebase';

const usersCollection = firestore.collection('users');

export async function getUsers(): Promise<User[]> {
    try {
        const snapshot = await usersCollection.get();
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function findUserBy(predicate: (user: User) => boolean): Promise<User | undefined> {
    const allUsers = await getUsers();
    const user = allUsers.find(predicate);
    return user ? { ...user } : undefined;
};

export async function findUserById(id: string): Promise<User | undefined> {
    try {
        const doc = await usersCollection.doc(id).get();
        return doc.exists ? doc.data() as User : undefined;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return undefined;
    }
};

export async function findUserByPhone(phone: string): Promise<User | undefined> {
    try {
        const snapshot = await usersCollection.where('phone', '==', phone).where('deletedAt', '==', null).limit(1).get();
        if (snapshot.empty) {
            return undefined;
        }
        return snapshot.docs[0].data() as User;
    } catch (error) {
        // Firestore requires an index for this query. If it doesn't exist, it will throw.
        // We'll fall back to client-side filtering as a backup.
        console.warn("Firestore query for phone number failed (likely missing index), falling back to client-side filter.");
        return findUserBy(user => user.phone === phone && !user.deletedAt);
    }
};

export async function addUser(user: User): Promise<void> {
    try {
        await usersCollection.doc(user.id).set(user);
    } catch (error) {
        console.error("Error adding user:", error);
    }
};

export async function updateUser(updatedUser: User): Promise<boolean> {
    try {
        await usersCollection.doc(updatedUser.id).set(updatedUser, { merge: true });
        return true;
    } catch (error) {
        console.error(`Error updating user ${updatedUser.id}:`, error);
        return false;
    }
};

export async function deleteUserPermanently(id: string): Promise<boolean> {
    try {
        await usersCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return false;
    }
}
