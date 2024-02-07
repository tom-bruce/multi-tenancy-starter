import { validateRequest } from "@/lib/validate-request";
import {
  CreateNextContextOptions,
  NextApiRequest,
  NextApiResponse,
} from "@trpc/server/adapters/next";

export async function createContextInner(req: NextApiRequest, res: NextApiResponse) {
  const { session, user } = await validateRequest(req, res);
  return {
    session,
    user,
    req,
    res,
  };
}
export const createContext = async (opts: CreateNextContextOptions) => {
  return createContextInner(opts.req, opts.res);
};

export type Context = Awaited<ReturnType<typeof createContext>>;
