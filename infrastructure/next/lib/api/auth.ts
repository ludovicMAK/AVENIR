import { NextRequest, NextResponse } from "next/server";

export function getAuthHeaders(request: NextRequest): {
  userId: string | null;
  token: string | null;
} {
  const userId = request.headers.get("x-user-id");
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || null;

  return { userId, token };
}

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
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as StrictError) },
      { status: 500 }
    );
  }
}

export function requireRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

type StrictError = Error & { message: string } | { message: string } | string;

function getErrorMessage(error: StrictError): string {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error.message === "string" ? error.message : "Internal server error";
}
