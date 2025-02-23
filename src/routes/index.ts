import { Hono } from 'hono';

// owners
import auth from '@/routes/auth.route';
import storage from '@/routes/file.route';
import foods from '@/routes/foods.route';
import categories from '@/routes/categories.route';

const app = new Hono()
    // owners
    .route('/auth', auth)
    .route('/storage', storage)
    .route('/foods', foods)
    .route('/categories', categories);

export default app;
