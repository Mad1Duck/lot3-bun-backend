import { Hono } from 'hono';

// owners
import auth from '@/routes/auth.route';
import storage from '@/routes/file.route';
import ipfs from '@/routes/ipfs.route';
import { verifyApiKey } from '@/middleware/apiKey.middleware';

const app = new Hono()
    // owners
    .use("*", verifyApiKey)
    .route('/auth', auth)
    .route('/storage', storage)
    .route('/ipfs', ipfs);

export default app;
