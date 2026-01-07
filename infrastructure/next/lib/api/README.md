# Middleware & API Helpers Documentation

## 📚 Overview

Les helpers API simplifient la gestion de l'authentification, des erreurs et de la validation dans les routes Next.js.

---

## 🔐 Authentication (`lib/api/auth.ts`)

### `verifyAuth(request: NextRequest)`

Vérifie l'authentification et retourne les credentials ou une erreur 401.

```typescript
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);

  if (auth instanceof NextResponse) {
    return auth; // 401 error
  }

  const { userId, token } = auth;
  // Use userId and token...
}
```

### `withAuth(request, handler)`

Wrapper pour routes authentifiées avec gestion d'erreur automatique.

```typescript
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, token) => {
    // Your logic here
    const data = await someUseCase.execute({ userId, token });
    return NextResponse.json(data, { status: 200 });
  });
}
```

### `getAuthHeaders(request)`

Extrait les headers d'authentification sans validation.

```typescript
const { userId, token } = getAuthHeaders(request);
```

---

## ❌ Error Handling (`lib/api/errors.ts`)

### `handleError(error)`

Gère les erreurs et retourne une réponse HTTP appropriée.

```typescript
try {
  const result = await useCase.execute(data);
  return successResponse(result);
} catch (error) {
  return handleError(error); // Maps error codes to HTTP status
}
```

### `asyncHandler(handler)`

Wrapper async avec gestion d'erreur automatique.

```typescript
export async function GET(request: NextRequest) {
  return asyncHandler(async () => {
    const data = await getData();
    return successResponse(data);
  });
}
```

### Response Helpers

```typescript
// Success (200)
successResponse({ data: "value" });

// Created (201)
createdResponse({ id: "123" });

// No Content (204)
noContentResponse();
```

### `ApiError` Class

```typescript
throw new ApiError("User not found", ErrorCode.NOT_FOUND, "USER_NOT_FOUND");
```

---

## ✅ Validation (`lib/api/validation.ts`)

### `validateRequired(body, fields)`

Valide la présence des champs requis.

```typescript
const body = await request.json();
const validation = validateRequired(body, ["email", "password"]);

if (!validation.valid) {
  return NextResponse.json(
    { error: `Missing: ${validation.missing?.join(", ")}` },
    { status: 400 }
  );
}
```

### `parseBody(request)`

Parse le JSON avec gestion d'erreur.

```typescript
const body = await parseBody(request); // Throws if invalid JSON
```

### `getQueryParams(request)`

Extrait les query parameters.

```typescript
const params = getQueryParams(request);
const page = params.get("page") || "1";
```

### Validation Helpers

```typescript
isValidEmail("test@example.com"); // true
isValidUUID("550e8400-e29b-41d4-a716-446655440000"); // true
sanitizeInput("<script>alert('xss')</script>"); // Safe string
```

---

## 🎯 Usage Examples

### Example 1: Public Route

```typescript
import { NextRequest } from "next/server";
import { getAllShares } from "@/config/usecases";
import { handleError, successResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const shares = await getAllShares.execute();
    return successResponse(shares);
  } catch (error) {
    return handleError(error);
  }
}
```

### Example 2: Protected Route with Validation

```typescript
import { NextRequest } from "next/server";
import { createAccount } from "@/config/usecases";
import {
  withAuth,
  parseBody,
  validateRequired,
  createdResponse,
} from "@/lib/api";

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, token) => {
    const body = await parseBody(request);

    const validation = validateRequired(body, ["accountType", "accountName"]);

    if (!validation.valid) {
      throw new Error(`Missing fields: ${validation.missing?.join(", ")}`);
    }

    const account = await createAccount.execute({
      ...body,
      token,
      idOwner: userId,
    });

    return createdResponse(account);
  });
}
```

### Example 3: Route with Query Parameters

```typescript
import { NextRequest } from "next/server";
import { getAccountsFromOwnerId } from "@/config/usecases";
import { getQueryParams, successResponse, handleError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const ownerId = params.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        { error: "ownerId is required" },
        { status: 400 }
      );
    }

    const accounts = await getAccountsFromOwnerId.execute({ id: ownerId });
    return successResponse(accounts);
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 🔄 Migration Guide

### Before (Manual Auth Check)

```typescript
export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!userId || !token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = await useCase.execute({ ...body, userId, token });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### After (Using Helpers)

```typescript
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, token) => {
    const body = await parseBody(request);
    const result = await useCase.execute({ ...body, userId, token });
    return createdResponse(result);
  });
}
```

---

## 📝 Best Practices

1. **Use `withAuth` for protected routes** - Automatic auth + error handling
2. **Use `handleError` consistently** - Unified error responses
3. **Validate inputs early** - Use `validateRequired` before use case execution
4. **Use response helpers** - Consistent status codes (`successResponse`, `createdResponse`, etc.)
5. **Log errors in production** - Extend `handleError` with proper logging service

---

## 🛡️ Security Notes

- Headers `x-user-id` et `Authorization: Bearer <token>` requis pour routes protégées
- `sanitizeInput()` prévient les XSS
- Validation des emails et UUIDs disponible
- Erreurs 500 loggées automatiquement (étendre pour production)

---

## 🚀 Next Steps

**Phase 4 : Tests** - Tester les routes avec les nouveaux helpers
**Phase 5 : Finitions** - Ajouter Zod pour validation de schémas (optionnel)
