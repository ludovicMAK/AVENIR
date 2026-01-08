import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonValue } from "@/types/json";
import {
  UserRole,
  UserStatus,
  UserSummary,
  UserWithStats,
} from "@/types/users";
import { request } from "./client";

const invalidUsersResponseError = () =>
  new ApiError(
    "INFRASTRUCTURE_ERROR",
    "Invalid users payload received from API."
  );

const isRole = (value: string): value is UserRole =>
  value === "customer" || value === "bankManager" || value === "bankAdvisor";

const isStatus = (value: string): value is UserStatus =>
  value === "active" || value === "banned";

const toUserSummary = (value: JsonValue): UserSummary => {
  if (!isJsonObject(value)) throw invalidUsersResponseError();

  const id = value.id;
  const firstname = value.firstname;
  const lastname = value.lastname;
  const role = value.role;
  const status = value.status;

  if (
    typeof id !== "string" ||
    typeof firstname !== "string" ||
    typeof lastname !== "string" ||
    typeof role !== "string" ||
    typeof status !== "string" ||
    !isRole(role) ||
    !isStatus(status)
  ) {
    throw invalidUsersResponseError();
  }

  return { id, firstname, lastname, role, status };
};

const extractUsers = (response: JsonValue): UserSummary[] => {
  if (!isJsonObject(response)) throw invalidUsersResponseError();

  const usersJson = response.users;
  if (!Array.isArray(usersJson)) throw invalidUsersResponseError();

  return usersJson.map(toUserSummary);
};

const extractUser = (response: JsonValue): UserSummary => {
  if (!isJsonObject(response)) throw invalidUsersResponseError();

  const userJson = response.user;
  if (userJson === undefined || !isJsonObject(userJson))
    throw invalidUsersResponseError();

  return toUserSummary(userJson);
};

const toUserWithStats = (value: JsonValue): UserWithStats => {
  if (!isJsonObject(value)) throw invalidUsersResponseError();

  const summary = toUserSummary(value);
  const {
    accountsCount,
    openAccountsCount,
    totalBalance,
    totalAvailableBalance,
  } = value;

  if (
    typeof accountsCount !== "number" ||
    typeof openAccountsCount !== "number" ||
    typeof totalBalance !== "number" ||
    typeof totalAvailableBalance !== "number"
  ) {
    throw invalidUsersResponseError();
  }

  return {
    ...summary,
    accountsCount,
    openAccountsCount,
    totalBalance,
    totalAvailableBalance,
  };
};

const extractUsersWithStats = (response: JsonValue): UserWithStats[] => {
  if (!isJsonObject(response)) throw invalidUsersResponseError();

  const usersJson = response.users;
  if (!Array.isArray(usersJson)) throw invalidUsersResponseError();

  return usersJson.map(toUserWithStats);
};

export const usersApi = {
  async list(authToken?: string): Promise<UserSummary[]> {
    const response = await request<JsonValue>("/users", {
      method: "GET",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    return extractUsers(response);
  },

  async listWithStats(authToken?: string): Promise<UserWithStats[]> {
    const response = await request<JsonValue>("/users/stats", {
      method: "GET",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    return extractUsersWithStats(response);
  },

  async me(authToken: string): Promise<UserSummary> {
    const response = await request<JsonValue>("/users/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    return extractUser(response);
  },

  async ban(userId: string, authToken?: string): Promise<void> {
    await request(`/users/${userId}/ban`, {
      method: "PATCH",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  async unban(userId: string, authToken?: string): Promise<void> {
    await request(`/users/${userId}/unban`, {
      method: "PATCH",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  async delete(userId: string, authToken?: string): Promise<void> {
    await request(`/users/${userId}`, {
      method: "DELETE",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },
};
