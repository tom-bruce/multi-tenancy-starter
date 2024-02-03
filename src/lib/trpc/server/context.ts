import { validateRequest } from "@/lib/validate-request";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const createContext = async (opts: CreateNextContextOptions) => {
  const { session, user } = await validateRequest(opts.req, opts.res);
  return {
    session,
    user,
    req: opts.req,
    res: opts.res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
