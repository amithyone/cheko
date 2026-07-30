/**
 * Auth API — replace mock login with real authentication.
 * Base path suggestion: POST /api/v1/auth/*
 */

import type { StaffAccount, UserRole } from "@/types";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  displayName: string;
}

/** POST /api/v1/auth/login */
export async function login(_req: LoginRequest): Promise<LoginResponse> {
  throw new Error("Not implemented — wire to backend auth service");
}

/** POST /api/v1/auth/logout */
export async function logout(): Promise<void> {
  throw new Error("Not implemented");
}

/** GET /api/v1/auth/me */
export async function getCurrentUser(): Promise<LoginResponse | null> {
  throw new Error("Not implemented");
}

/** GET /api/v1/staff — list operator accounts */
export async function listStaffAccounts(): Promise<StaffAccount[]> {
  throw new Error("Not implemented");
}

/** POST /api/v1/staff — create terminal account */
export async function createStaffAccount(
  _account: Omit<StaffAccount, "id" | "createdAt">
): Promise<StaffAccount> {
  throw new Error("Not implemented");
}

/** PATCH /api/v1/staff/:id */
export async function updateStaffAccount(
  _id: string,
  _patch: Partial<StaffAccount>
): Promise<StaffAccount> {
  throw new Error("Not implemented");
}

/** DELETE /api/v1/staff/:id */
export async function deleteStaffAccount(_id: string): Promise<void> {
  throw new Error("Not implemented");
}
