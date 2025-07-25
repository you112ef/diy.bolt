import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// Define the PagesFunction type if not available
interface PagesFunction {
  (context: {
    request: Request;
    env: Record<string, any>;
    params: Record<string, string>;
    data: Record<string, any>;
    next?: () => Promise<Response>;
    waitUntil: (promise: Promise<any>) => void;
  }): Promise<Response>;
}

export const onRequest: PagesFunction = async (context) => {
  try {
    // Import the server build with proper error handling
    const serverBuild = (await import('../build/server/index.js')) as unknown as ServerBuild;

    // Validate server build
    if (!serverBuild || typeof serverBuild !== 'object') {
      throw new Error('Invalid server build');
    }

    // Create the handler with proper configuration
    const handler = createPagesFunctionHandler({
      build: serverBuild,
      mode: context.env.NODE_ENV === 'development' ? 'development' : 'production',
      getLoadContext: () => ({
        env: context.env,
        cf: context.request.cf,
        ctx: context,
      }),
    });

    return await handler(context);
  } catch (error) {
    console.error('Cloudflare Pages function error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: context.request.url,
      method: context.request.method,
      timestamp: new Date().toISOString(),
    });
    
    // Return a proper error response with CORS headers
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request',
        timestamp: new Date().toISOString(),
        ...(context.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
};
