import { z } from 'zod';

export const foodSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  categoryId: z.string(),
  isAvailable: z.boolean(),
  imageURL: z.string(),
  timeToCook: z.string()
});

export type FoodSchemaType = z.infer<typeof foodSchema>;