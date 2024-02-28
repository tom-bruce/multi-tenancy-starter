import { AppRouter } from "@/lib/trpc/server/routers/_app";
import { TRPCClientErrorLike } from "@trpc/client";

export function isRateLimited(error: TRPCClientErrorLike<AppRouter>) {
  return error.data?.code === "TOO_MANY_REQUESTS";
}
