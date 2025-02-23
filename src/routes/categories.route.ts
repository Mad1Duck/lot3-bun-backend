
import { Hono } from 'hono';
import { getCategories, patchCategory, postCategory, removeCategory } from '@/controllers/categories/categories.controller';
import { authentication, authenticationAdministrator } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/zod.middleware';
import { foodSchema } from '@/validator/food.validator';

const app = new Hono()
  .use(authentication)
  .get('/', authenticationAdministrator, getCategories)
  .post('/', authenticationAdministrator, validate(foodSchema), postCategory)
  .patch('/:id', authenticationAdministrator, validate(foodSchema), patchCategory)
  .delete('/:id', authenticationAdministrator, removeCategory);

export default app;