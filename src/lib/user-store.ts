
import type { User } from './types';
import { initialUsers } from './mock-data';

// This ensures the store persists across hot reloads in development,
// making our in-memory "database" more consistent.
declare global {
  var usersStore: User[] | undefined;
}

// Centralized functions to interact with the user store
// This avoids issues with module caching in Next.js dev server.
const getStore = (): User[] => {
    if (!globalThis.usersStore) {
        globalThis.usersStore = initialUsers;
    }
    return globalThis.usersStore;
};

export const getUsers = (): User[] => {
    // Return a copy to prevent mutation
    return getStore().map(u => ({ ...u }));
}

export const findUserBy = (predicate: (user: User) => boolean): User | undefined => {
    // Return a copy to prevent mutation of the original object in the store from the caller
    const user = getStore().find(predicate);
    return user ? { ...user } : undefined;
};

export const findUserById = (id: string): User | undefined => {
    return findUserBy(user => user.id === id);
};

export const findUserByPhone = (phone: string): User | undefined => {
    return findUserBy(user => user.phone === phone && !user.deletedAt);
};

export const addUser = (user: User): void => {
    getStore().push(user);
};

export const updateUser = (updatedUser: User): boolean => {
    const users = getStore();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        return true;
    }
    return false;
};

export const deleteUserPermanently = (id: string): boolean => {
    const users = getStore();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        return true;
    }
    return false;
}
