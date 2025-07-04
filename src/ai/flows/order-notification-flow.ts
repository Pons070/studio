
'use server';
/**
 * @fileOverview A flow to generate and send order-related email notifications.
 *
 * - sendOrderNotification - Generates and sends an email for order events.
 * - OrderNotificationInput - The input type for the sendOrderNotification function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { OrderNotificationInputSchema } from '@/lib/schemas';
import type { OrderNotificationInput } from '@/lib/schemas';

const EmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z
    .string()
    .describe('The HTML body of the email. It should be professional, well-formatted, and friendly.'),
});

// This is an exported wrapper function that can be called from React components.
export async function sendOrderNotification(
  input: OrderNotificationInput
): Promise<void> {
  await orderNotificationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'orderEmailPrompt',
  input: { schema: OrderNotificationInputSchema },
  output: { schema: EmailOutputSchema },
  prompt: `
    You are an email generation assistant for a restaurant called "CulinaPreOrder".
    Generate a professional and friendly email based on the provided order details and notification type.
    The email should be in HTML format.

    Order Details:
    - Order ID: {{{order.id}}}
    - Order Placed On: {{{order.orderDate}}}
    - Pre-Order Date: {{{order.pickupDate}}}
    - Pickup Time: {{{order.pickupTime}}}
    - Status: {{{order.status}}}
    {{#if order.cancellationDate}}
    - Cancelled On: {{{order.cancellationDate}}}
    {{/if}}
    {{#if order.cancelledBy}}
    - Cancelled By: {{{order.cancelledBy}}}
    {{/if}}
    {{#if order.cancellationReason}}
    - Cancellation Reason: {{{order.cancellationReason}}}
    {{/if}}
    - Total: Rs.{{{order.total}}}
    - Items:
      {{#each order.items}}
      - {{this.quantity}}x {{this.name}} (Rs.{{this.price}})
      {{/each}}

    Notification Type: {{{notificationType}}}

    Follow these instructions for each notification type:
    - "customerConfirmation": Write a confirmation email to the customer. Thank them for their order and confirm the details. Let them know you're excited to serve them.
    - "adminNotification": Write a notification email to the restaurant admin. Alert them that a new order has been placed and provide all the details.
    - "customerCancellation": Write an email to the customer confirming that their order has been cancelled. Express regret and invite them to order again in the future. {{#if order.cancellationReason}}Clearly state that the cancellation was due to the following reason: "{{{order.cancellationReason}}}".{{/if}}
  `,
});

const orderNotificationFlow = ai.defineFlow(
  {
    name: 'orderNotificationFlow',
    inputSchema: OrderNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { output } = await emailPrompt(input);
    if (!output) {
      console.error('Failed to generate email content.');
      return;
    }

    const { subject, body } = output;

    let toEmail: string;
    switch (input.notificationType) {
      case 'customerConfirmation':
      case 'customerCancellation':
        toEmail = input.customerEmail;
        break;
      case 'adminNotification':
        toEmail = input.adminEmail;
        break;
    }
    
    // Simulate sending email by logging to the console
    console.log('--- SIMULATING EMAIL ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(body);
    console.log('----------------------');
  }
);
