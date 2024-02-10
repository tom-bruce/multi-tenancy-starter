import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { ZodError } from "zod";
import { Organisation } from "@/lib/organisation";
import { baseOrgInputSchema } from "@/features/organisation/schemas";
import type { OrganisationRole } from "@/lib/db/schema";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

const isAuthenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
    },
  });
});

/**
 * Verifies that the user has access to the organisation they are requesting resources in.
 *
 * This middleware also extends the request context with organisation and membership data.
 *
 * The orgSlug is required in the request input so that react query can properly
 * isolate tenant data on the client side.
 * An alternative to this would be swapping sessions on the server when the user switches
 * organisations, however this isn't preferred as it would clear the entire client side cache.
 */
const hasOrganisationAccessMiddleware = isAuthenticatedMiddleware.unstable_pipe(async (opts) => {
  const rawInput = await opts.getRawInput();
  const parsedInput = baseOrgInputSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "orgSlug is missing from request input" });
  }

  const userOrg = await Organisation.withMembershipByUserId({
    orgSlug: parsedInput.data.orgSlug,
    userId: opts.ctx.user.id,
  });
  if (!userOrg) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this organisation",
    });
  }
  return opts.next({ ctx: { organisation: userOrg } });
});

/**
 * Factory function for generating a procedure requiring a specific role
 */
export function roleProtectedProcedure(role: OrganisationRole) {
  const middleware = hasOrganisationAccessMiddleware.unstable_pipe(async (opts) => {
    if (opts.ctx.organisation.organisationRole !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have the required role to perform this action`,
      });
    }
    return opts.next();
  });
  return organisationProcedure.use(middleware);
}

export const organisationProcedure = t.procedure.use(hasOrganisationAccessMiddleware);

export const protectedProcedure = t.procedure.use(isAuthenticatedMiddleware);
