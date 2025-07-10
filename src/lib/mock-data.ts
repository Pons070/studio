
import type { User, MenuItem, Order, Review, Promotion, BrandInfo } from './types';

export const initialUsers: User[] = [
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

export const initialMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Bruschetta",
    description: "Toasted bread with tomatoes, garlic, and basil.",
    price: 8.99,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "bruschetta appetizer",
    category: "Appetizers",
    isAvailable: true,
    isFeatured: false
  },
  {
    id: "2",
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, and basil.",
    price: 10.5,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "caprese salad",
    category: "Appetizers",
    isAvailable: true,
    isFeatured: false
  },
  {
    id: "3",
    name: "Spaghetti Carbonara",
    description: "Pasta with eggs, cheese, pancetta, and pepper.",
    price: 15.99,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "spaghetti carbonara",
    category: "Main Courses",
    isAvailable: true,
    isFeatured: true
  },
  {
    id: "4",
    name: "Margherita Pizza",
    description: "Classic pizza with tomatoes, mozzarella, and basil.",
    price: 14.5,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "margherita pizza",
    category: "Main Courses",
    isAvailable: true,
    isFeatured: true
  },
  {
    id: "5",
    name: "Grilled Salmon",
    description: "Served with asparagus and lemon butter sauce.",
    price: 22,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "grilled salmon",
    category: "Main Courses",
    isAvailable: true,
    isFeatured: true
  },
  {
    id: "6",
    name: "Tiramisu",
    description: "Coffee-flavored Italian dessert.",
    price: 7.5,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "tiramisu dessert",
    category: "Desserts",
    isAvailable: true,
    isFeatured: false
  },
  {
    id: "7",
    name: "Panna Cotta",
    description: "Sweetened cream thickened with gelatin.",
    price: 6.99,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "panna cotta",
    category: "Desserts",
    isAvailable: true,
    isFeatured: false
  },
  {
    id: "8",
    name: "Mineral Water",
    description: "Still or sparkling water.",
    price: 3,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "water bottle",
    category: "Drinks",
    isAvailable: true,
    isFeatured: false
  },
  {
    id: "9",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice.",
    price: 5.5,
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "orange juice",
    category: "Drinks",
    isAvailable: true,
    isFeatured: false
  }
];

export const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "user-alice",
    customerName: "Alice",
    address: {
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
    },
    orderDate: "2023-10-26",
    pickupDate: "2023-10-27",
    pickupTime: "18:00",
    status: "Completed",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 2
      },
      {
        id: "6",
        name: "Tiramisu",
        price: 7.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 39.48,
    reviewId: "REV-001"
  },
  {
    id: "ORD-002",
    customerId: "user-diana",
    customerName: "Diana",
    address: {
      id: "addr-diana-1",
      label: "Home",
      isDefault: true,
      doorNumber: "100",
      apartmentName: "Olympus Towers",
      area: "Themyscira Plaza",
      city: "Paradise Island",
      state: "Amazonia",
      pincode: "23456"
    },
    orderDate: "2023-11-15",
    pickupDate: "2023-11-16",
    pickupTime: "19:00",
    status: "Completed",
    items: [
      {
        id: "5",
        name: "Grilled Salmon",
        price: 22,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      },
      {
        id: "2",
        name: "Caprese Salad",
        price: 10.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 32.5,
    reviewId: "REV-004"
  },
  {
    id: "ORD-003",
    customerId: "user-charlie",
    customerName: "Charlie",
    address: {
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
    },
    orderDate: "2023-12-01",
    pickupDate: "2023-12-02",
    pickupTime: "12:30",
    status: "Completed",
    items: [
      {
        id: "4",
        name: "Margherita Pizza",
        price: 14.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 2
      },
      {
        id: "1",
        name: "Bruschetta",
        price: 8.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 37.99,
    reviewId: "REV-003"
  },
  {
    id: "ORD-004",
    customerId: "user-eve",
    customerName: "Eve",
    address: {
      id: "addr-eve-1",
      label: "Home",
      isDefault: true,
      doorNumber: "1",
      apartmentName: "Garden House",
      area: "Eden Estates",
      city: "First City",
      state: "Genesis",
      pincode: "45678"
    },
    orderDate: "2024-01-05",
    pickupDate: "2024-01-06",
    pickupTime: "18:30",
    status: "Cancelled",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 15.99,
    cancellationDate: "2024-01-05",
    cancelledBy: "customer",
    cancellationReason: "Change of plans",
    cancellationAction: "refund",
    reviewId: "REV-005"
  },
  {
    id: "ORD-005",
    customerId: "user-bob",
    customerName: "Bob",
    address: {
      id: "addr-bob-1",
      label: "Home",
      isDefault: true,
      doorNumber: "B2",
      apartmentName: "Builder Complex",
      area: "Construct Lane",
      city: "Tool-Town",
      state: "Handy State",
      pincode: "56789"
    },
    orderDate: "2024-02-10",
    pickupDate: "2024-02-11",
    pickupTime: "20:00",
    status: "Completed",
    items: [
      {
        id: "4",
        name: "Margherita Pizza",
        price: 14.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      },
      {
        id: "2",
        name: "Caprese Salad",
        price: 10.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 25,
    reviewId: "REV-002"
  },
  {
    id: "ORD-006",
    customerId: "user-alice",
    customerName: "Alice",
    address: {
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
    },
    orderDate: "2024-03-18",
    pickupDate: "2024-03-20",
    pickupTime: "19:30",
    status: "Pending",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 15.99
  }
];

export const initialReviews: Review[] = [
  {
    id: "REV-001",
    orderId: "ORD-001",
    customerName: "Alice",
    rating: 5,
    comment: "The Spaghetti Carbonara was absolutely divine! Best I have ever had. Will be ordering again soon!",
    date: "2023-10-27",
    adminReply: "Thank you so much, Alice! We are thrilled you enjoyed it and look forward to serving you again.",
    isPublished: true
  },
  {
    id: "REV-002",
    orderId: "ORD-005",
    customerName: "Bob",
    rating: 4,
    comment: "Great pizza and the Caprese salad was very fresh. The pickup process was quick and easy. Would recommend.",
    date: "2024-02-11",
    isPublished: true
  },
  {
    id: "REV-003",
    orderId: "ORD-003",
    customerName: "Charlie",
    rating: 5,
    comment: "Delicious food and excellent service. The pre-order system is so convenient!",
    date: "2023-12-02",
    isPublished: true
  },
  {
    id: "REV-004",
    orderId: "ORD-002",
    customerName: "Diana",
    rating: 4,
    comment: "The food was amazing, as always. A bit of a wait during pickup, but it was a busy night. Overall, a great experience.",
    date: "2023-11-16",
    adminReply: "Thank you for your feedback, Diana! We apologize for the delay and are working to improve our pickup times during peak hours.",
    isPublished: true
  },
  {
    id: "REV-005",
    orderId: "ORD-004",
    customerName: "Eve",
    rating: 3,
    comment: "Food was decent, but my order was slightly delayed. The staff was apologetic and friendly.",
    date: "2024-01-06",
    isPublished: false
  }
];

export const initialBrandInfo: BrandInfo = {
  name: "CulinaPreOrder",
  logoUrl: "",
  logoShape: "square",
  phone: "123-456-7890",
  adminEmail: "admin@example.com",
  showAddressInAbout: true,
  showPhoneInAbout: true,
  address: {
    label: "Main Branch",
    doorNumber: "123",
    apartmentName: "Foodie Building",
    area: "Flavor Town",
    city: "Metropolis",
    state: "Culinary State",
    pincode: "12345"
  },
  about: "CulinaPreOrder was born from a passion for exquisite food and a desire to make fine dining accessible. We believe in quality ingredients, handcrafted recipes, and the convenience of pre-ordering, allowing you to enjoy gourmet meals without the wait.",
  businessHours: {
    status: "open",
    message: "We are temporarily closed. Please check back later!"
  },
  youtubeUrl: "",
  instagramUrl: "",
  allowOrderUpdates: true,
  theme: {
    primaryColor: "32 85% 67%",
    backgroundColor: "30 67% 92%",
    accentColor: "14 72% 62%",
    cardColor: "0 0% 100%",
    cardOpacity: 1,
    borderRadius: 0.5,
    backgroundImageUrl: ""
  },
  blockedCustomerEmails: [],
  deliveryAreas: [
    {
      id: "da-1",
      pincode: "12345",
      areaName: "Flavor Town",
      cost: 50
    },
    {
      id: "da-2",
      pincode: "23456",
      areaName: "Paradise Island",
      cost: 75
    },
    {
      id: "da-3",
      pincode: "34567",
      areaName: "Confectionville",
      cost: 60
    }
  ]
};

export const initialPromotions: Promotion[] = [
  {
    id: "PROMO-1",
    title: "🎉 Welcome Offer for New Customers!",
    description: "Get 15% off your first order with us. We are so happy to have you!",
    targetAudience: "new",
    isActive: true,
    couponCode: "WELCOME15",
    discountType: "percentage",
    discountValue: 15
  },
  {
    id: "PROMO-2",
    title: "Weekday Special for Regulars!",
    description: "Enjoy a free dessert on us as a thank you for your continued support. Valid on weekdays.",
    targetAudience: "existing",
    isActive: true,
    couponCode: "SWEETTREAT",
    discountType: "flat",
    discountValue: 7.5,
    minOrderValue: 20,
    startDate: "2024-06-01",
    activeDays: [
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    id: "PROMO-3",
    title: "Summer Special - All Customers",
    description: "Get a free drink with any main course ordered this month.",
    targetAudience: "all",
    isActive: false,
    couponCode: "SUMMERDRINK",
    discountType: "flat",
    discountValue: 3,
    startDate: "2023-07-01",
    endDate: "2023-07-31"
  }
];

export const initialFavorites = {
  "user-alice": {
    itemIds: ["3", "6"],
    orderIds: ["ORD-001"]
  },
  "user-diana": {
    itemIds: ["5"],
    orderIds: []
  }
};
