import { Hono } from 'hono';

// owners
import auth from '@/routes/auth.route';
import storage from '@/routes/file.route';
import ipfs from '@/routes/ipfs.route';

const app = new Hono()
    // owners
    .route('/auth', auth)
    .route('/storage', storage)
    .route('/ipfs', ipfs);

export default app;
