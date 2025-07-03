

export type Address = {
  doorNumber: string;
  apartmentName: string;
  floorNumber?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Appetizers' | 'Main Courses' | 'Desserts' | 'Drinks';
  aiHint: string;
  isAvailable: boolean;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type Order = {
  id:string;
  customerId: string;
  customerName: string;
  orderDate: string; // The date the order was placed
  pickupDate: string; // The date for pre-order pickup
  pickupTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  total: number;
  items: CartItem[];
  reviewId?: string;
  cancellationDate?: string; // The date the order was cancelled
  cancellationReason?: string;
};

export type Review = {
  id: string;
  orderId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  adminReply?: string;
  isPublished: boolean;
};

export type BrandInfo = {
  name: string;
  logoUrl: string;
  phone: string;
  address: Address;
  about: string;
  businessHours: {
    status: 'open' | 'closed';
    message: string;
  };
  youtubeUrl?: string;
  instagramUrl?: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  targetAudience: 'all' | 'new' | 'existing';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  activeDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
};
