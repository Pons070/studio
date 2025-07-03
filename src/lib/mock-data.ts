
import type { MenuItem, Order, Review, BrandInfo } from './types';

export const brandInfo: BrandInfo = {
  name: 'CulinaPreOrder',
  logoUrl: '',
  phone: '123-456-7890',
  address: '123 Foodie Lane, Flavor Town, 12345',
  about: 'CulinaPreOrder was born from a passion for exquisite food and a desire to make fine dining accessible. We believe in quality ingredients, handcrafted recipes, and the convenience of pre-ordering, allowing you to enjoy gourmet meals without the wait.',
  businessHours: {
    status: 'open',
    message: 'We are temporarily closed. Please check back later!',
  },
  youtubeUrl: '',
  instagramUrl: '',
};

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bruschetta',
    description: 'Toasted bread with tomatoes, garlic, and basil.',
    price: 8.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'bruschetta appetizer',
    category: 'Appetizers',
  },
  {
    id: '2',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, and basil.',
    price: 10.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'caprese salad',
    category: 'Appetizers',
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and pepper.',
    price: 15.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'spaghetti carbonara',
    category: 'Main Courses',
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomatoes, mozzarella, and basil.',
    price: 14.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'margherita pizza',
    category: 'Main Courses',
  },
    {
    id: '5',
    name: 'Grilled Salmon',
    description: 'Served with asparagus and lemon butter sauce.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'grilled salmon',
    category: 'Main Courses',
  },
  {
    id: '6',
    name: 'Tiramisu',
    description: 'Coffee-flavored Italian dessert.',
    price: 7.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'tiramisu dessert',
    category: 'Desserts',
  },
  {
    id: '7',
    name: 'Panna Cotta',
    description: 'Sweetened cream thickened with gelatin.',
    price: 6.99,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'panna cotta',
    category: 'Desserts',
  },
  {
    id: '8',
    name: 'Mineral Water',
    description: 'Still or sparkling water.',
    price: 3.00,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'water bottle',
    category: 'Drinks',
  },
    {
    id: '9',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice.',
    price: 5.50,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'orange juice',
    category: 'Drinks',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    date: '2023-10-26',
    pickupTime: '18:30',
    status: 'Completed',
    total: 32.48,
    items: [
      { id: '3', name: 'Spaghetti Carbonara', price: 15.99, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '6', name: 'Tiramisu', price: 7.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
    reviewId: 'REV-001'
  },
  {
    id: 'ORD-002',
    date: '2023-11-15',
    pickupTime: '19:00',
    status: 'Confirmed',
    total: 25.00,
    items: [
      { id: '4', name: 'Margherita Pizza', price: 14.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '2', name: 'Caprese Salad', price: 10.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
  },
  {
    id: 'ORD-003',
    date: '2023-12-01',
    pickupTime: '12:00',
    status: 'Pending',
    total: 27.50,
    items: [
      { id: '5', name: 'Grilled Salmon', price: 22.00, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '9', name: 'Fresh Orange Juice', price: 5.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
  },
   {
    id: 'ORD-004',
    date: '2024-01-05',
    pickupTime: '20:00',
    status: 'Cancelled',
    total: 19.49,
    items: [
      { id: '1', name: 'Bruschetta', price: 8.99, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '7', name: 'Panna Cotta', price: 6.99, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '8', name: 'Mineral Water', price: 3.00, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
  },
  {
    id: 'ORD-005',
    date: '2024-02-10',
    pickupTime: '13:00',
    status: 'Completed',
    total: 25.00,
    items: [
       { id: '4', name: 'Margherita Pizza', price: 14.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
       { id: '2', name: 'Caprese Salad', price: 10.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
    reviewId: 'REV-002',
  },
  {
    id: 'ORD-006',
    date: '2024-03-20',
    pickupTime: '19:30',
    status: 'Completed',
    total: 27.50,
    items: [
      { id: '5', name: 'Grilled Salmon', price: 22.00, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
      { id: '9', name: 'Fresh Orange Juice', price: 5.50, quantity: 1, imageUrl: 'https://placehold.co/600x400.png' },
    ],
  },
];

export const reviews: Review[] = [
  {
    id: 'REV-001',
    orderId: 'ORD-001',
    customerName: 'Alice',
    rating: 5,
    comment: 'The Spaghetti Carbonara was absolutely divine! Best I have ever had. Will be ordering again soon!',
    date: '2023-10-27',
    adminReply: 'Thank you so much, Alice! We are thrilled you enjoyed it and look forward to serving you again.',
  },
  {
    id: 'REV-002',
    orderId: 'ORD-005',
    customerName: 'Bob',
    rating: 4,
    comment: 'Great pizza and the Caprese salad was very fresh. The pickup process was quick and easy. Would recommend.',
    date: '2024-02-11',
  },
  {
    id: 'REV-003',
    orderId: 'ORD-003',
    customerName: 'Charlie',
    rating: 5,
    comment: 'Delicious food and excellent service. The pre-order system is so convenient!',
    date: '2023-12-02',
  },
    {
    id: 'REV-004',
    orderId: 'ORD-002',
    customerName: 'Diana',
    rating: 4,
    comment: 'The food was amazing, as always. A bit of a wait during pickup, but it was a busy night. Overall, a great experience.',
    date: '2023-11-16',
    adminReply: 'Thank you for your feedback, Diana! We apologize for the delay and are working to improve our pickup times during peak hours.',
  },
  {
    id: 'REV-005',
    orderId: 'ORD-004',
    customerName: 'Eve',
    rating: 3,
    comment: 'Food was decent, but my order was slightly delayed. The staff was apologetic and friendly.',
    date: '2024-01-06',
  }
]
