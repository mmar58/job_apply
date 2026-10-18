import { Redis } from "ioredis";
import { env } from "../config/env.js";

// TTL Constants
export const MATCH_SCORE_TTL_SECONDS = 48 * 60 * 60; // 48 hours sliding TTL
export const SUMMARY_TTL_SECONDS = 20 * 60; // 20 minutes fixed TTL

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            username: env.REDIS_USER || undefined,
            password: env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 2,
            enableReadyCheck: true,
            lazyConnect: true,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 100, 3000);
                return delay;
            },
        });

        redisClient.on("connect", () => {
            console.log("Redis connected successfully");
        });

        redisClient.on("error", (err: any) => {
            console.warn("Redis connection warning:", err?.message || err);
        });

        // Trigger connection in background
        redisClient.connect().catch((err: any) => {
            console.warn("Redis initial connect error (fallback active):", err?.message || err);
        });
    }

    return redisClient;
}

// ----------------- Matching Score (48 Hours Sliding TTL) -----------------
export async function getCachedMatchScore(jobId: number, candidateId: number): Promise<number | null> {
    try {
        const client = getRedisClient();
        const key = `match_score:${jobId}:${candidateId}`;
        const val = await client.get(key);
        if (val !== null && val !== undefined) {
            // Sliding TTL: Renew TTL by 48 hours on every access
            client.expire(key, MATCH_SCORE_TTL_SECONDS).catch(() => {});
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? null : parsed;
        }
    } catch (e) {
        console.warn("Redis getCachedMatchScore error:", e);
    }
    return null;
}

export async function setCachedMatchScore(jobId: number, candidateId: number, score: number): Promise<void> {
    try {
        const client = getRedisClient();
        const key = `match_score:${jobId}:${candidateId}`;
        await client.set(key, Math.round(score).toString(), "EX", MATCH_SCORE_TTL_SECONDS);
    } catch (e) {
        console.warn("Redis setCachedMatchScore error:", e);
    }
}

// ----------------- Candidate AI Summary & Feedback (20 Minutes TTL) -----------------
export async function getCachedSummary<T>(jobId: number, candidateId: number): Promise<T | null> {
    try {
        const client = getRedisClient();
        const key = `candidate_summary:${jobId}:${candidateId}`;
        const data = await client.get(key);
        if (data) {
            return JSON.parse(data) as T;
        }
    } catch (e) {
        console.warn("Redis getCachedSummary error:", e);
    }
    return null;
}

export async function setCachedSummary<T>(jobId: number, candidateId: number, data: T): Promise<void> {
    try {
        const client = getRedisClient();
        const key = `candidate_summary:${jobId}:${candidateId}`;
        await client.set(key, JSON.stringify(data), "EX", SUMMARY_TTL_SECONDS);
    } catch (e) {
        console.warn("Redis setCachedSummary error:", e);
    }
}
