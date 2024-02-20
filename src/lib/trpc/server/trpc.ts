import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { ZodError } from "zod";
import { Organisation } from "@/lib/organisation";
import { baseOrgInputSchema } from "@/features/organisation/schemas";
import type { OrganisationRole } from "@/lib/db/schema";
import { RateLimitType, rateLimiter } from "@/lib/rate-limiter";

interface Metadata {
  rateLimitType: RateLimitType;
  skipEmailVerificationCheck?: boolean;
}
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC
  .context<Context>()
  .meta<Metadata>()
  .create({
    defaultMeta: { rateLimitType: "core", skipEmailVerificationCheck: false },
    transformer: superjson,
    errorFormatter({ shape, error, ctx }) {
      return {
        ratelimit: {
          limit: ctx?.res.getHeader("X-RateLimit-Limit"),
          remaining: ctx?.res.getHeader("X-RateLimit-Remaining"),
          reset: ctx?.res.getHeader("X-RateLimit-Reset"),
        },
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

const isAuthenticatedMiddleware = t.middleware(({ ctx, next, meta }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!meta?.skipEmailVerificationCheck && !ctx.user.verifiedAt) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please verify your email to access the API",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
    },
  });
});

const isAuthenticatedRatelimitMiddleware = isAuthenticatedMiddleware.unstable_pipe(async (opts) => {
  const limiter = rateLimiter();
  const limitResult = await limiter({
    limitType: (opts.meta ?? { rateLimitType: "core" }).rateLimitType,
    identifier: opts.ctx.user.id,
  });

  opts.ctx.res.setHeader("X-RateLimit-Limit", limitResult.limit);
  opts.ctx.res.setHeader("X-RateLimit-Remaining", limitResult.remaining);
  opts.ctx.res.setHeader("X-RateLimit-Reset", limitResult.reset);

  if (!limitResult.success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return opts.next();
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
const hasOrganisationAccessMiddleware = isAuthenticatedRatelimitMiddleware.unstable_pipe(
  async (opts) => {
    const rawInput = await opts.getRawInput();
    const parsedInput = baseOrgInputSchema.safeParse(rawInput);
    if (!parsedInput.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "orgSlug is missing from request input",
      });
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
  }
);

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

export const protectedProcedure = t.procedure.use(isAuthenticatedRatelimitMiddleware);
