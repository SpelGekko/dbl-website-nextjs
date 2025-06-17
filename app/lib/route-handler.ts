import type { NextRequest } from 'next/server';

/**
 * This file exports utility types for Next.js App Router Route Handlers
 * to fix TypeScript errors during build.
 */

export type Params<T extends string = string> = {
  params: Record<T, string>;
};

export type RouteHandlerParams = {
  params: { [key: string]: string | string[] };
};

export type GetRouteHandler = (
  req: NextRequest, 
  ctx: RouteHandlerParams
) => Promise<Response>;

export type PostRouteHandler = (
  req: NextRequest, 
  ctx: RouteHandlerParams
) => Promise<Response>;

/**
 * Use this helper to create a properly typed route handler
 */
export function createRouteHandler<T extends RouteHandlerParams>(
  handler: (req: NextRequest, ctx: T) => Promise<Response>
) {
  return handler;
}
