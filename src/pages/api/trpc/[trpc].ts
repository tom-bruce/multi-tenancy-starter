import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "@/lib/trpc/server/routers/_app";
import { createContext } from "@/lib/trpc/server/context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError(opts) {
    const { error, type, path, input, ctx, req } = opts;
    console.error("Error:", error);
    if (error.code === "INTERNAL_SERVER_ERROR") {
      // send to bug reporting
    }
  },
});
