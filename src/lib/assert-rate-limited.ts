import { TRPCError } from "@trpc/server";
import { RateLimitType, rateLimiter } from "./rate-limiter";

export async function assertRateLimited({
  limitType,
  identifier,
}: {
  limitType: RateLimitType;
  identifier: string;
}) {
  const limiter = rateLimiter();
  const limitResult = await limiter({
    limitType,
    identifier,
  });

  if (!limitResult.success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
  return limitResult;
}
