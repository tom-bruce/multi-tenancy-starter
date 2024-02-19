import {
  baseOrgInputSchema,
  createOrganisationSchema,
  inviteSchema,
} from "@/features/organisation/schemas";
import { organisationProcedure, protectedProcedure, roleProtectedProcedure, router } from "../trpc";
import { Organisation } from "@/lib/organisation";
import { assertNever, getBaseUrl, sluggify } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendMail } from "@/lib/email/send-mail";
import OrganisationInvite from "@/lib/email/templates/organisation-invite";
import { INVITE_ERRORS, ORGANISATION_INVITE_URL } from "@/features/organisation/config";

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
  members: organisationProcedure.input(baseOrgInputSchema).query(async ({ input, ctx }) => {
    return Organisation.listMembers({ orgId: ctx.organisation.id });
  }),
  acceptInvite: protectedProcedure
    .meta({ rateLimitType: "auth" })
    .input(z.object({ inviteToken: z.string().min(1) }))
    .mutation(async (opts) => {
      /* 
        TODO this might need more strict rate limiting to prevent brute force attacks
        Although the user needs to be logged in with the same email as the invited email
        (which is verified on sign up)
      */
      const acceptResult = await Organisation.acceptInvitation({
        inviteToken: opts.input.inviteToken,
        loggedInUser: {
          email: opts.ctx.user.email,
          id: opts.ctx.user.id,
        },
      });
      if (!acceptResult._ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: acceptResult.error.message });
      }
      return;
    }),
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

      const acceptInviteUrl = new URL(
        `${ORGANISATION_INVITE_URL}/${inviteResult.value.inviteToken}`,
        getBaseUrl()
      );
      await sendMail({
        subject: `You've been invited to join ${ctx.organisation.name} on Template`,
        to: input.email,
        react: OrganisationInvite({
          acceptInviteUrl: acceptInviteUrl.toString(),
          oragnisationName: ctx.organisation.name,
        }),
      });
      return;
    }),
  inviteDetails: protectedProcedure
    .input(z.object({ inviteToken: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const inviteDetails = await Organisation.byInviteToken({
        inviteToken: input.inviteToken,
        invitedEmail: ctx.user.email,
      });
      if (!inviteDetails) {
        // TODO use a config error message and handle on the frontend
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      return inviteDetails;
    }),
  revokeInvite: roleProtectedProcedure("admin")
    .input(baseOrgInputSchema)
    .mutation(async ({ ctx }) => {}),
  invites: roleProtectedProcedure("admin")
    .input(baseOrgInputSchema)
    .query(async ({ ctx }) => {
      return Organisation.listPendingInvites({ orgId: ctx.organisation.id });
    }),
});
