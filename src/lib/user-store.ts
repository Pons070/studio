
import type { User, Address } from './types';

// This ensures the store persists across hot reloads in development,
// making our in-memory "database" more consistent.
declare global {
  var userStore: User[] | undefined;
}

const aliceAddress: Address = {
    doorNumber: '4A',
    apartmentName: 'Wonderland Apts',
    area: 'Rabbit Hole District',
    city: 'Curious City',
    state: 'Imagi Nation',
    pincode: '12345',
    latitude: 34.0522,
    longitude: -118.2437,
};

const dianaAddress: Address = {
    doorNumber: '100',
    apartmentName: 'Olympus Towers',
    area: 'Themyscira Plaza',
    city: 'Paradise Island',
    state: 'Amazonia',
    pincode: '23456'
};

const charlieAddress: Address = {
    doorNumber: '22B',
    apartmentName: 'Chocolate Factory',
    area: 'Sweet Street',
    city: 'Confectionville',
    state: 'Sugarland',
    pincode: '34567',
    latitude: 40.7128,
    longitude: -74.0060,
};

const eveAddress: Address = {
    doorNumber: '1',
    apartmentName: 'Garden House',
    area: 'Eden Estates',
    city: 'First City',
    state: 'Genesis',
    pincode: '45678'
};

const bobAddress: Address = {
    doorNumber: 'B2',
    apartmentName: 'Builder Complex',
    area: 'Construct Lane',
    city: 'Tool-Town',
    state: 'Handy State',
    pincode: '56789'
};

const frankAddress: Address = {
    doorNumber: 'C-3',
    apartmentName: 'Castle Apartments',
    area: 'Kingdom Valley',
    city: 'Nobleburg',
    state: 'Regalia',
    pincode: '67890',
    latitude: 51.5074,
    longitude: -0.1278,
};

const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Admin',
    email: 'admin@example.com',
    phone: '5550100',
    addresses: [],
  },
  {
    id: 'user-alice',
    name: 'Alice',
    email: 'alice@example.com',
    phone: '5550101',
    addresses: [{ ...aliceAddress, id: 'addr-alice-1', label: 'Home', isDefault: true }],
  },
  {
    id: 'user-diana',
    name: 'Diana',
    email: 'diana@example.com',
    phone: '5550102',
    addresses: [{ ...dianaAddress, id: 'addr-diana-1', label: 'Home', isDefault: true }],
  },
  {
    id: 'user-charlie',
    name: 'Charlie',
    email: 'charlie@example.com',
    phone: '5550103',
    addresses: [{ ...charlieAddress, id: 'addr-charlie-1', label: 'Work', isDefault: true }],
  },
  {
    id: 'user-eve',
    name: 'Eve',
    email: 'eve@example.com',
    phone: '5550104',
    addresses: [{ ...eveAddress, id: 'addr-eve-1', label: 'Home', isDefault: true }],
  },
  {
    id: 'user-bob',
    name: 'Bob',
    email: 'bob@example.com',
    phone: '5550105',
    addresses: [{ ...bobAddress, id: 'addr-bob-1', label: 'Home', isDefault: true }],
  },
  {
    id: 'user-frank',
    name: 'Frank',
    email: 'frank@example.com',
    phone: '5550106',
    addresses: [{ ...frankAddress, id: 'addr-frank-1', label: 'Home', isDefault: true }],
  }
];

if (!global.userStore) {
  global.userStore = initialUsers;
}

export const users: User[] = global.userStore;
