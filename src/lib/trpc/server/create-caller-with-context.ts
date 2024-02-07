import { NextApiRequest, NextApiResponse } from "next";
import { createContextInner } from "./context";
import { appRouter } from "./routers/_app";
import { createCallerFactory } from "./trpc";

export async function createCallerWithContext(req: NextApiRequest, res: NextApiResponse) {
  const createCaller = createCallerFactory(appRouter);
  const context = await createContextInner(req, res);
  return createCaller(context);
}
