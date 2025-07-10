
import type { User } from './types';

const initialUsers: User[] = [
  {
    id: "user-admin",
    name: "Admin",
    email: "admin@example.com",
    phone: "5550100",
    addresses: [],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-alice",
    name: "Alice",
    email: "alice@example.com",
    phone: "5550101",
    addresses: [
      {
        id: "addr-alice-1",
        label: "Home",
        isDefault: true,
        doorNumber: "4A",
        apartmentName: "Wonderland Apts",
        area: "Rabbit Hole District",
        city: "Curious City",
        state: "Imagi Nation",
        pincode: "12345",
        latitude: 34.0522,
        longitude: -118.2437
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-diana",
    name: "Diana",
    email: "diana@example.com",
    phone: "5550102",
    addresses: [
      {
        id: "addr-diana-1",
        label: "Home",
        isDefault: true,
        doorNumber: "100",
        apartmentName: "Olympus Towers",
        area: "Themyscira Plaza",
        city: "Paradise Island",
        state: "Amazonia",
        pincode: "23456"
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-charlie",
    name: "Charlie",
    email: "charlie@example.com",
    phone: "5550103",
    addresses: [
      {
        id: "addr-charlie-1",
        label: "Work",
        isDefault: true,
        doorNumber: "22B",
        apartmentName: "Chocolate Factory",
        area: "Sweet Street",
        city: "Confectionville",
        state: "Sugarland",
        pincode: "34567",
        latitude: 40.7128,
        longitude: -74.006
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-eve",
    name: "Eve",
    email: "eve@example.com",
    phone: "5550104",
    addresses: [
      {
        id: "addr-eve-1",
        label: "Home",
        isDefault: true,
        doorNumber: "1",
        apartmentName: "Garden House",
        area: "Eden Estates",
        city: "First City",
        state: "Genesis",
        pincode: "45678"
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-bob",
    name: "Bob",
    email: "bob@example.com",
    phone: "5550105",
    addresses: [
      {
        id: "addr-bob-1",
        label: "Home",
        isDefault: true,
        doorNumber: "B2",
        apartmentName: "Builder Complex",
        area: "Construct Lane",
        city: "Tool-Town",
        state: "Handy State",
        pincode: "56789"
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  },
  {
    id: "user-frank",
    name: "Frank",
    email: "frank@example.com",
    phone: "5550106",
    addresses: [
      {
        id: "addr-frank-1",
        label: "Home",
        isDefault: true,
        doorNumber: "C-3",
        apartmentName: "Castle Apartments",
        area: "Kingdom Valley",
        city: "Nobleburg",
        state: "Regalia",
        pincode: "67890",
        latitude: 51.5074,
        longitude: -0.1278
      }
    ],
    createdAt: "2024-07-30T12:00:00.000Z",
    updatedAt: "2024-07-30T12:00:00.000Z"
  }
];

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
