// This is a workaround file to fix type issues with Next.js route handlers
// Reference: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

// You can import these types in your route handlers
export type RouteHandlerParams<T extends Record<string, string>> = {
  params: T;
};
