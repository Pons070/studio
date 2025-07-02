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
  date: z.string(),
  pickupTime: z.string(),
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
  total: z.number(),
  items: z.array(CartItemSchema),
  reviewId: z.string().optional(),
});
