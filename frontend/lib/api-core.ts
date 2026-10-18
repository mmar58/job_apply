export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public fieldErrors?: Record<string, string[]>,
    ) {
        super(message)
    }
}

export type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | boolean | null | undefined>;
    cookie?: string;
    signal?: AbortSignal;
}

export function buildUrl(path: string, query?: RequestOptions["query"]) {
    const url = new URL(`${API_URL}${path}`);
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        })
    }
    return url.toString();
}

export async function request<T>(path: string, opts: RequestOptions = {}) {
    const headers: Record<string, string> = { "X-Requested-With": "XMLHttpRequest" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.cookie) headers.cookie = opts.cookie;

    let res: Response;
    try {
        res = await fetch(buildUrl(path, opts.query), {
            method: opts.method ?? "GET",
            headers,
            body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
            credentials: "include",
            cache: "no-store",
            signal: opts.signal,
        });
    } catch {
        throw new ApiError(0, "Cannot reach the server. Please check your connection and try again.");
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`, data?.details);
    }
    return data as T;
}