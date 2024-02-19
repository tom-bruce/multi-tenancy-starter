import { router } from "../trpc";
import { userRouter } from "./user";
import { organisationRouter } from "./organisation";

export const appRouter = router({
  user: userRouter,
  organisation: organisationRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
