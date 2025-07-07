
import type { BrandInfo } from './types';

export let brandInfo: BrandInfo = {
  name: 'CulinaPreOrder',
  logoUrl: '',
  logoShape: 'square',
  phone: '123-456-7890',
  address: {
    doorNumber: '123',
    apartmentName: 'Foodie Building',
    area: 'Flavor Town',
    city: 'Metropolis',
    state: 'Culinary State',
    pincode: '12345',
  },
  about: 'CulinaPreOrder was born from a passion for exquisite food and a desire to make fine dining accessible. We believe in quality ingredients, handcrafted recipes, and the convenience of pre-ordering, allowing you to enjoy gourmet meals without the wait.',
  businessHours: {
    status: 'open',
    message: 'We are temporarily closed. Please check back later!',
  },
  youtubeUrl: '',
  instagramUrl: '',
  allowOrderUpdates: true,
  theme: {
    primaryColor: '222.2 47.4% 11.2%',
    backgroundColor: '0 0% 100%',
    accentColor: '210 40% 96.1%',
    cardColor: '0 0% 100%',
    cardOpacity: 1,
    borderRadius: 0.5,
    backgroundImageUrl: '',
  },
  blockedCustomerEmails: [],
  deliveryAreas: [
    { id: 'da-1', pincode: '12345', areaName: 'Flavor Town', cost: 50 },
    { id: 'da-2', pincode: '23456', areaName: 'Paradise Island', cost: 75 },
    { id: 'da-3', pincode: '34567', areaName: 'Confectionville', cost: 60 },
  ],
};

export function setBrandInfo(newBrandInfo: BrandInfo) {
  brandInfo = newBrandInfo;
}
