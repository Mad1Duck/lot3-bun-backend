
import { Hono } from 'hono';
import { getFoods, postFood } from '@/controllers/foods/foods.controller';
import { authentication, authenticationAdministrator } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/zod.middleware';
import { foodSchema } from '@/validator/food.validator';

const app = new Hono()
  .use(authentication)
  .get('/', authenticationAdministrator, getFoods)
  .post('/', authenticationAdministrator, validate(foodSchema), postFood);

export default app;