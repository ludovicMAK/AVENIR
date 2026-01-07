import { NextRequest, NextResponse } from "next/server";

/**
 * Extract authentication headers from request
 */
export function getAuthHeaders(request: NextRequest): {
  userId: string | null;
  token: string | null;
} {
  const userId = request.headers.get("x-user-id");
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || null;

  return { userId, token };
}

/**
 * Verify authentication and return error response if missing
 */
export function verifyAuth(request: NextRequest):
  | {
      userId: string;
      token: string;
    }
  | NextResponse {
  const { userId, token } = getAuthHeaders(request);

  if (!userId || !token) {
    return NextResponse.json(
      {
        error:
          "Authentication required. Please provide x-user-id header and Authorization token.",
      },
      { status: 401 }
    );
  }

  return { userId, token };
}

/**
 * Middleware wrapper for authenticated routes
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (userId: string, token: string, request: NextRequest) => Promise<T>
): Promise<NextResponse | T> {
  const auth = verifyAuth(request);

  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    return await handler(auth.userId, auth.token, request);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check if user has specific role
 */
export function requireRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}
