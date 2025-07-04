'use server';
/**
 * @fileOverview An AI flow to analyze restaurant business data and provide insights.
 *
 * - getBusinessInsights - A function that analyzes sales, menu, and review data.
 * - BusinessInsightsInput - The input type for the getBusinessInsights function.
 * - BusinessInsightsOutput - The return type for the getBusinessInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BusinessInsightsInputSchema = z.object({
  totalRevenue: z.number().describe('The total revenue in the local currency.'),
  totalOrders: z.number().describe('The total number of completed orders.'),
  averageOrderValue: z.number().describe('The average value per order.'),
  totalReviews: z.number().describe('The total number of reviews received.'),
  averageRating: z.number().describe('The average customer rating out of 5.'),
  bestSellingItems: z
    .array(z.string())
    .describe('A list of the names of the best-selling menu items.'),
  worstSellingItems: z
    .array(z.string())
    .describe('A list of the names of the worst-selling menu items.'),
});
export type BusinessInsightsInput = z.infer<typeof BusinessInsightsInputSchema>;

const BusinessInsightsOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe(
      "A brief, two-sentence summary of the business's current state based on the data."
    ),
  strengths: z
    .array(z.string())
    .describe('A list of key strengths based on the data.'),
  opportunities: z
    .array(z.string())
    .describe(
      'A list of potential opportunities for growth or improvement.'
    ),
  recommendations: z
    .array(
      z.object({
        title: z
          .string()
          .describe('A short, catchy title for the recommendation.'),
        description: z
          .string()
          .describe(
            "A detailed description of the recommended action and why it's important."
          ),
      })
    )
    .describe('A list of 3-4 concrete, actionable recommendations.'),
});
export type BusinessInsightsOutput = z.infer<
  typeof BusinessInsightsOutputSchema
>;

const insightsPrompt = ai.definePrompt({
  name: 'businessInsightsPrompt',
  input: { schema: BusinessInsightsInputSchema },
  output: { schema: BusinessInsightsOutputSchema },
  prompt: `You are an expert restaurant business consultant. Analyze the following data for a pre-order restaurant and provide a concise, actionable report.

Business Data:
- Total Revenue: Rs.{{{totalRevenue}}}
- Total Completed Orders: {{{totalOrders}}}
- Average Order Value: Rs.{{{averageOrderValue}}}
- Total Reviews: {{{totalReviews}}}
- Average Rating: {{{averageRating}}} / 5
- Best-Selling Items: {{#each bestSellingItems}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Worst-Selling Items: {{#each worstSellingItems}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Your task is to generate a report with the following sections:
1.  **Executive Summary:** A very brief, two-sentence overview of the business's health.
2.  **Strengths:** Identify key strengths. What is the business doing well?
3.  **Opportunities:** What are the most significant areas for potential growth or improvement?
4.  **Recommendations:** Provide 3-4 specific, actionable recommendations. For each recommendation, provide a clear title and a detailed description of what to do and why. Be creative and focus on marketing, menu engineering, and customer engagement.

Focus on providing high-quality, insightful advice. Do not just repeat the input data. Interpret it. For example, if the average order value is low, suggest upselling strategies or combo meals. If a certain item sells well, suggest promotions around it.
`,
});

const businessInsightsFlow = ai.defineFlow(
  {
    name: 'businessInsightsFlow',
    inputSchema: BusinessInsightsInputSchema,
    outputSchema: BusinessInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await insightsPrompt(input);
    return output!;
  }
);

export async function getBusinessInsights(
  input: BusinessInsightsInput
): Promise<BusinessInsightsOutput> {
  return businessInsightsFlow(input);
}
