export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Appetizers' | 'Main Courses' | 'Desserts' | 'Drinks';
  aiHint: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type Order = {
  id: string;
  date: string;
  pickupTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  total: number;
  items: CartItem[];
};
