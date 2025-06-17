/**
 * This file extends the default Next.js types to fix any issues with route handlers.
 * It's referenced in the tsconfig.json file.
 */

import type { NextRequest } from 'next/server';

/**
 * Declaration merging to augment Next.js types
 */
declare module 'next/server' {
  /**
   * Properly typed route handler parameters
   */
  export interface RouteHandlerContext<Params extends Record<string, string | string[]> = Record<string, string | string[]>> {
    params: Params;
  }
}

/**
 * Types for route handlers with dynamic parameters
 */
export type RouteParams<T extends Record<string, string>> = {
  params: T;
};

/**
 * Route handler type for GET requests
 */
export type GetRouteHandler<Params extends Record<string, string> = Record<string, string>> = 
  (request: NextRequest, context: { params: Params }) => Promise<Response> | Response;

/**
 * Route handler type for POST requests
 */
export type PostRouteHandler<Params extends Record<string, string> = Record<string, string>> = 
  (request: NextRequest, context: { params: Params }) => Promise<Response> | Response;
