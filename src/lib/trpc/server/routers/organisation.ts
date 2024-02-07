import { baseOrgInputSchema, createOrganisationSchema } from "@/features/organisation/schemas";
import { organisationProcedure, protectedProcedure, router } from "../trpc";
import { Organisation } from "@/lib/organisation";
import { sluggify } from "@/lib/utils";

export const organisationRouter = router({
  create: protectedProcedure.input(createOrganisationSchema).mutation(async (opts) => {
    return Organisation.create({
      name: opts.input.name,
      slug: sluggify(opts.input.name),
      ownerId: opts.ctx.user.id,
    });
  }),
  list: protectedProcedure.query(async (opts) => {
    return Organisation.byUserId({ userId: opts.ctx.user.id });
  }),
  bySlug: organisationProcedure.input(baseOrgInputSchema).query(async (opts) => {
    return opts.ctx.organisation;
  }),
});
