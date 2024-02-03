import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "@/lib/trpc/server/routers/_app";
import { createContext } from "@/lib/trpc/server/context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
