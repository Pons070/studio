

export type UpdateRequest = {
  id: string;
  message: string;
  timestamp: string;
  from: 'customer' | 'admin';
};

export type Address = {
  id?: string;
  label?: string;
  isDefault?: boolean;
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

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  addresses?: Address[];
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
  isFeatured?: boolean;
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
  address: Address;
  orderDate: string; // The date the order was placed
  pickupDate: string; // The date for pre-order pickup
  pickupTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  total: number;
  items: CartItem[];
  reviewId?: string;
  cancellationDate?: string; // The date the order was cancelled
  cancellationReason?: string;
  cookingNotes?: string;
  updateRequests?: UpdateRequest[];
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

export type ThemeSettings = {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  cardColor: string;
  cardOpacity: number;
  borderRadius: number;
  backgroundImageUrl: string;
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
  allowOrderUpdates?: boolean;
  theme?: ThemeSettings;
  blockedCustomerEmails?: string[];
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

    
