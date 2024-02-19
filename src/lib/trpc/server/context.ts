import { validateRequest } from "@/lib/validate-request";
import {
  CreateNextContextOptions,
  NextApiRequest,
  NextApiResponse,
} from "@trpc/server/adapters/next";

export async function createContextInner(req: NextApiRequest, res: NextApiResponse) {
  const { session, user } = await validateRequest(req, res);

  // NOTE x-forwarded-for headers can only be trusted with a suitable gateway in front
  // ie Vercel, Cloudfront etc. Different providers will have different rules for setting the headers
  const forwaredForHeader = req.headers["x-forwarded-for"];
  const clientIp = forwaredForHeader
    ? Array.isArray(forwaredForHeader)
      ? forwaredForHeader.pop() ?? null
      : forwaredForHeader
    : null;

  if (!clientIp) throw new Error("Missing client IP");
  return {
    session,
    user,
    req,
    res,
    clientIp,
  };
}
export const createContext = async (opts: CreateNextContextOptions) => {
  return createContextInner(opts.req, opts.res);
};

export type Context = Awaited<ReturnType<typeof createContext>>;
