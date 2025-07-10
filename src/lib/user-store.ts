
import fs from 'fs';
import path from 'path';
import type { User } from './types';

const dataFilePath = path.join(process.cwd(), 'data/users.json');

function readUsers(): User[] {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeUsers(users: User[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
}

export function getUsers(): User[] {
  return readUsers();
}

export function findUserBy(predicate: (user: User) => boolean): User | undefined {
    const user = readUsers().find(predicate);
    return user ? { ...user } : undefined;
};

export const findUserById = (id: string) => findUserBy(user => user.id === id);
export const findUserByPhone = (phone: string) => findUserBy(user => user.phone === phone && !user.deletedAt);


export function addUser(user: User): void {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
};

export function updateUser(updatedUser: User): boolean {
  const users = readUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    writeUsers(users);
    return true;
  }
  return false;
};

export function deleteUserPermanently(id: string): boolean {
    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    if (users.length < initialLength) {
        writeUsers(users);
        return true;
    }
    return false;
}
