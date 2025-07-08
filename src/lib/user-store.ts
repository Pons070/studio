
import { initialUsers } from './mock-data';
import type { User } from './types';

let users: User[] = [...initialUsers];

export const getUsers = (): User[] => {
    return users.map(u => ({ ...u }));
}

export const findUserBy = (predicate: (user: User) => boolean): User | undefined => {
    const user = users.find(predicate);
    return user ? { ...user } : undefined;
};

export const findUserById = (id: string): User | undefined => {
    return findUserBy(user => user.id === id);
};

export const findUserByPhone = (phone: string): User | undefined => {
    return findUserBy(user => user.phone === phone && !user.deletedAt);
};

export const addUser = (user: User): void => {
    users.push(user);
};

export const updateUser = (updatedUser: User): boolean => {
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        return true;
    }
    return false;
};

export const deleteUserPermanently = (id: string): boolean => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        return true;
    }
    return false;
}
