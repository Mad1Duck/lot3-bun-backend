
import { Hono } from 'hono';
import { generateImage, metadataByCid } from '@/controllers/ipfs/ipfs.controller';

const app = new Hono()
  .post('/upload', generateImage)
  .get('/metadata/:cid', metadataByCid);

export default app;
