import {
  baseOrgInputSchema,
  createOrganisationSchema,
  inviteSchema,
} from "@/features/organisation/schemas";
import { organisationProcedure, protectedProcedure, roleProtectedProcedure, router } from "../trpc";
import { Organisation } from "@/lib/organisation";
import { assertNever, sluggify } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendMail } from "@/lib/email/send-mail";
import OrganisationInvite from "@/lib/email/templates/organisation-invite";
import { INVITE_ERRORS } from "@/features/organisation/config";

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
  acceptInvite: protectedProcedure
    .input(z.object({ inviteToken: z.string().min(1) }))
    .mutation(async (opts) => {}),
  invite: roleProtectedProcedure("admin")
    .input(baseOrgInputSchema.merge(inviteSchema))
    .mutation(async ({ ctx, input }) => {
      const inviteResult = await Organisation.createInvite({
        email: input.email,
        orgId: ctx.organisation.id,
        invitedByUserId: ctx.user.id,
      });
      if (!inviteResult._ok) {
        if (inviteResult.error.code === "InviteAlreadyExists") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: INVITE_ERRORS.INVITE_ALREADY_EXISTS,
          });
        } else if (inviteResult.error.code === "MemberAlreadyExists") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: INVITE_ERRORS.MEMBER_ALREADY_EXISTS,
          });
        } else {
          assertNever(inviteResult.error);
        }
      }
      await sendMail({
        subject: `You've been invited to join ${ctx.organisation.name} on Template`,
        to: input.email,
        react: OrganisationInvite({
          acceptInviteUrl: `http://localhost:3000/invite/${inviteResult.value.inviteToken}`,
          oragnisationName: ctx.organisation.name,
        }),
      });
      return;
    }),
  revokeInvite: roleProtectedProcedure("admin")
    .input(baseOrgInputSchema)
    .mutation(async ({ ctx }) => {}),
  invites: roleProtectedProcedure("admin")
    .input(baseOrgInputSchema)
    .query(async ({ ctx }) => {
      return Organisation.listInvites({ orgId: ctx.organisation.id });
    }),
});
