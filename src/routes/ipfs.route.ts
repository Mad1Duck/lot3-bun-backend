
import { Hono } from 'hono';
import { generateImage, metadataByCid } from '@/controllers/ipfs/ipfs.controller';
import { ticketSchema } from '@/validator/ticket.validator';
import { validate } from '@/middleware/zod.middleware';

const app = new Hono()
  .post('/upload', validate(ticketSchema), generateImage)
  .get('/metadata/:cid', metadataByCid);

export default app;
