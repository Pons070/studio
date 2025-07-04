

import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
  doorNumber: z.string().min(1, { message: "Door number is required." }),
  apartmentName: z.string().min(1, { message: "Apartment/Building name is required." }),
  floorNumber: z.string().optional(),
  area: z.string().min(1, { message: "Area name is required." }),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  pincode: z.string().min(5, { message: "A valid pincode is required." }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  quantity: z.number().int().positive(),
});

export const UpdateRequestSchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string(),
  from: z.enum(['customer', 'admin']),
});

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  address: AddressSchema,
  orderDate: z.string().describe("The date the order was placed."),
  pickupDate: z.string().describe("The date the customer will pick up the order."),
  pickupTime: z.string(),
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
  total: z.number(),
  items: z.array(CartItemSchema),
  reviewId: z.string().optional(),
  cancellationDate: z.string().optional().describe("The date the order was cancelled."),
  cancellationReason: z.string().optional().describe("The reason for cancelling the order."),
  cancelledBy: z.enum(['admin', 'customer']).optional().describe("Who cancelled the order."),
  cancellationAction: z.enum(['refund', 'donate']).optional().describe("The desired action for a cancelled order."),
  cookingNotes: z.string().optional(),
  updateRequests: z.array(UpdateRequestSchema).optional(),
  appliedCoupon: z.string().optional(),
  discountAmount: z.number().optional(),
});

const NotificationTypeSchema = z.enum([
  'customerConfirmation',
  'adminNotification',
  'customerCancellation',
]);

export const OrderNotificationInputSchema = z.object({
  order: OrderSchema,
  notificationType: NotificationTypeSchema,
  customerEmail: z.string().email(),
  adminEmail: z.string().email().default('sangkar111@gmail.com'),
});
export type OrderNotificationInput = z.infer<typeof OrderNotificationInputSchema>;
