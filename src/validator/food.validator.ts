import { z } from 'zod';

export const foodSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.string()
    .transform((val) => parseInt(val, 10))
    .optional()
    .pipe(z.number().int().min(0, 'Target amount must be a positive integer.').default(0)),
  categoryId: z.string().optional(),
  isAvailable: z.string()
    .transform((val) => Boolean(val))
    .optional()
    .pipe(z.boolean().default(false)),
  imageURL: z.string(),
  timeToCook: z.string()
    .transform((val) => parseInt(val, 10))
    .optional()
    .pipe(z.number().int().min(0, 'Target amount must be a positive integer.').default(0)),
});

export type FoodSchemaType = z.infer<typeof foodSchema>;