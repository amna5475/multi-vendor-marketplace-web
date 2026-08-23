import type { ApiSuccess } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: Partial<ApiSuccess<T>> & { errors?: unknown; message?: string } = {};
  try {
    payload = await response.json();
  } catch {
    payload = { message: "The API did not return JSON." };
  }

  if (!response.ok) {
    throw new ApiError(
      payload.statusCode ?? response.status,
      payload.message ?? "Request failed",
      payload.errors,
    );
  }

  return (payload.data as T) ?? (payload as T);
}

export function asList<T>(data: T[] | { rows?: T[]; logs?: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.logs)) return data.logs;
  return [];
}
