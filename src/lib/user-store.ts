
import fs from 'fs';
import path from 'path';
import type { User } from './types';

const dataFilePath = path.join(process.cwd(), 'data/users.json');
let usersCache: User[] | null = null;

function getStore(): User[] {
    if (usersCache) {
        return usersCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        usersCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Error: User data file not found at ${dataFilePath}. Please ensure it exists.`);
            return [];
        }
        throw error;
    }
}

function saveStore(data: User[]): void {
    usersCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


export const getUsers = (): User[] => {
    return getStore().map(u => ({ ...u }));
}

export const findUserBy = (predicate: (user: User) => boolean): User | undefined => {
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
    const store = getStore();
    store.push(user);
    saveStore(store);
};

export const updateUser = (updatedUser: User): boolean => {
    const store = getStore();
    const index = store.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        store[index] = updatedUser;
        saveStore(store);
        return true;
    }
    return false;
};

export const deleteUserPermanently = (id: string): boolean => {
    const store = getStore();
    const index = store.findIndex(u => u.id === id);
    if (index !== -1) {
        store.splice(index, 1);
        saveStore(store);
        return true;
    }
    return false;
}
