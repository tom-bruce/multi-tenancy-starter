import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export type RateLimitType = "core" | "auth" | "common" | "email";
export function rateLimiter() {
  const limiters: Record<RateLimitType, Ratelimit> = {
    core: new Ratelimit({
      redis,
      prefix: "ratelimit:core",
      limiter: Ratelimit.fixedWindow(30, "60s"),
      analytics: true,
    }),
    common: new Ratelimit({
      redis,
      prefix: "ratelimit:common",
      limiter: Ratelimit.fixedWindow(150, "60s"),
      analytics: true,
    }),
    auth: new Ratelimit({
      redis,
      prefix: "ratelimit:auth",
      limiter: Ratelimit.fixedWindow(5, "60s"),
      analytics: true,
    }),
    email: new Ratelimit({
      redis,
      prefix: "ratelimit:email",
      limiter: Ratelimit.fixedWindow(1, "5m"),
      analytics: true,
    }),
  };

  async function rateLimit({
    limitType,
    identifier,
  }: {
    limitType: keyof typeof limiters;
    identifier: string;
  }) {
    const result = await limiters[limitType].limit(identifier);
    return result;
  }

  return rateLimit;
}
