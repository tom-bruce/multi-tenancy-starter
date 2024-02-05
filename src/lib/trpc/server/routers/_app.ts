import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { userRouter } from "./user";
import { organisationRouter } from "./organisation";

export const appRouter = router({
  user: userRouter,
  organisation: organisationRouter,
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (opts) => {
      console.log("running");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
