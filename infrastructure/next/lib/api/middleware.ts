/**
 * Global API Middleware Configuration
 *
 * This file can be used to add global middleware to all API routes
 * such as CORS, rate limiting, logging, etc.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-user-id"
  );

  return response;
}

/**
 * Log API requests (development only)
 */
export function logRequest(request: NextRequest): void {
  // Logging disabled in production
}

/**
 * Global API middleware wrapper
 */
export async function apiMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Log request
  logRequest(request);

  // Handle OPTIONS for CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response);
  }

  // Execute handler
  const response = await handler();

  // Add CORS headers to response
  return addCorsHeaders(response);
}

/**
 * Rate limiting (simple in-memory implementation)
 * For production, use Redis or a rate limiting service
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
