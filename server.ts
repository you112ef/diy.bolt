import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from './build/server/index.js';

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => ({
    env: context.env,
    cf: context.request.cf,
    ctx: context,
  }),
});

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      return await handleRequest({
        request,
        env,
        params: {},
        data: {},
        next: () => Promise.resolve(new Response('Not found', { status: 404 })),
        waitUntil: ctx.waitUntil?.bind(ctx) || (() => {}),
      });
    } catch (error) {
      console.error('Server error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};