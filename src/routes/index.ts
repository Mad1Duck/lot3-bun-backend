import { Hono } from 'hono';

// owners
import auth from '@/routes/auth.route';
import storage from '@/routes/file.route';
import foods from '@/routes/foods.route';

const app = new Hono()
    // owners
    .route('/auth', auth)
    .route('/storage', storage)
    .route('/foods', foods);

export default app;
