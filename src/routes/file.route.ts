
import { Hono } from 'hono';
import { uploadThing } from '@/controllers/storage/file.controller';
import { generateImage, mintTicket } from '@/controllers/images/images.controller';

const app = new Hono()
    .post('/upload', uploadThing)
    .post('/upload-pinata', generateImage)
    .post('/mint', mintTicket);

export default app;
