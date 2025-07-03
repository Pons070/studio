import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  quantity: z.number().int().positive(),
});

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  orderDate: z.string().describe("The date the order was placed."),
  pickupDate: z.string().describe("The date the customer will pick up the order."),
  pickupTime: z.string(),
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
  total: z.number(),
  items: z.array(CartItemSchema),
  reviewId: z.string().optional(),
  cancellationDate: z.string().optional().describe("The date the order was cancelled."),
  cancellationReason: z.string().optional().describe("The reason for cancelling the order."),
});

const NotificationTypeSchema = z.enum([
  'customerConfirmation',
  'adminNotification',
  'customerCancellation',
]);

export const OrderNotificationInputSchema = z.object({
  order: OrderSchema,
  notificationType: NotificationTypeSchema,
  customerEmail: z.string().email().default('pons070@yahoo.in'),
  adminEmail: z.string().email().default('sangkar111@gmail.com'),
});
export type OrderNotificationInput = z.infer<typeof OrderNotificationInputSchema>;
