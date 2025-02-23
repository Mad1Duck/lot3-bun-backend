import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createBunWebSocket, serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { timeout } from 'hono/timeout';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import routes from './routes';
import { errorHandler } from '@/middleware/error.middleware';
import { join } from 'path';
import { ServerWebSocket } from 'bun';

const { upgradeWebSocket, websocket } = createBunWebSocket();

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables; }>()
  .use(logger())
  .use('/api', timeout(5000))
  .use(
    '/api/*',
    cors({
      origin: 'localhost',
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    })
  )
  .use(
    '/auth/*',
    jwt({
      secret: 'it-is-very-secret',
      alg: 'HS256',
    })
  )
  .use('/public/*', async (c) => {
    const publicPath = join(process.cwd(), 'public');

    const filePath = join(publicPath, c.req.path.replace('/public/', ''));
    const file = Bun.file(filePath);
    return new Response(file);
  })

  .use('/file-data/*', serveStatic({
    root: './public',
    rewriteRequestPath: (path) => {

      const filePath = path.replace('/file-data/', '');

      console.log(filePath);

      return filePath;
    }
  }))

  .route('/api', routes)
  .get('/ws/:topic', upgradeWebSocket((c) => {
    const topic = c.req.param('topic');

    return {
      onOpen(_, ws) {
        const rawWs = ws.raw as ServerWebSocket;
        rawWs.subscribe(topic);
        console.log(`Client connected and subscribed to '${topic}'`);
      },
      onMessage(evt, ws) {
        const message = evt.data;
        const rawWs = ws.raw as ServerWebSocket;
        console.log(`Message on '${topic}':`, message);
        rawWs.publish(topic, message.toString());
      },
      onClose(_, ws) {
        const rawWs = ws.raw as ServerWebSocket;
        rawWs.unsubscribe(topic);
        console.log(`Client disconnected from '${topic}'`);
      },
    };
  }))

  .onError(errorHandler);

export default {
  port: process.env.PORT || 8080,
  fetch: app.fetch,
};

export type AppType = typeof app;