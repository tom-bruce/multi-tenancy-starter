import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { members } from "./db/schema/members";
import { organisations } from "./db/schema/organisations";
import { organisationInvites } from "./db/schema/organisation-invites";
import { generateId } from "lucia";
import { TimeSpan, createDate } from "oslo";
import { users } from "./db/schema/users";
import { result } from "./result";
import { CodedError } from "./error";
import { gt } from "drizzle-orm";

export * as Organisation from "./organisation";

export async function create({
  name,
  slug,
  ownerId,
}: {
  name: string;
  slug: string;
  ownerId: string;
}) {
  // return db.transaction(async (tx) => {
  const newOrg = await db
    .insert(organisations)
    .values({ name, slug })
    .returning({ id: organisations.id })
    .execute()
    .then((result) => result[0]);

  if (!newOrg) {
    throw new Error("Error creating organisation");
  }
  const memberId = await db
    .insert(members)
    .values({ userId: ownerId, organisationId: newOrg.id, organisationRole: "admin" })
    .returning({ memberId: members.id })
    .execute()
    .then((result) => result[0]?.memberId);

  if (!memberId) {
    throw new Error("Error creating organisation owner");
  }

  return { orgId: newOrg.id, memberId, slug };
  // });
}

export async function byUserId({ userId }: { userId: string }) {
  const orgList = await db
    .select({
      id: organisations.id,
      name: organisations.name,
      slug: organisations.slug,
      joinedAt: members.createdAt,
      organisationRole: members.organisationRole,
    })
    .from(members)
    .innerJoin(organisations, eq(members.organisationId, organisations.id))
    .where(eq(members.userId, userId))
    .execute();
  return orgList;
  // .then((result) => result.map((row) => row.organisationId));
}

export async function bySlug({ slug }: { slug: string }) {
  return db
    .select()
    .from(organisations)
    .where(eq(organisations.slug, slug))
    .execute()
    .then((result) => result[0] ?? null);
}

export async function byId({ id }: { id: string }) {
  return db
    .select()
    .from(organisations)
    .where(eq(organisations.id, id))
    .execute()
    .then((result) => result[0] ?? null);
}

export async function withMembershipByUserId({
  orgSlug,
  userId,
}: {
  orgSlug: string;
  userId: string;
}) {
  return db
    .select({
      id: organisations.id,
      name: organisations.name,
      slug: organisations.slug,
      joinedAt: members.createdAt,
      memberId: members.id,
      organisationRole: members.organisationRole,
    })
    .from(members)
    .innerJoin(organisations, eq(members.organisationId, organisations.id))
    .where(and(eq(organisations.slug, orgSlug), eq(members.userId, userId)))
    .execute()
    .then((result) => result[0] ?? null);
}

export async function createInvite({
  invitedByUserId,
  email,
  orgId,
}: {
  invitedByUserId: string;
  orgId: string;
  email: string;
}) {
  async function existingOrgMembership() {
    return db
      .select({ id: members.id })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(and(eq(users.email, email), eq(members.organisationId, orgId)))
      .execute()
      .then((r) => r[0] ?? null);
  }

  async function existingPendingInvite() {
    return db
      .select({ id: organisationInvites.id })
      .from(organisationInvites)
      .where(
        and(
          eq(organisationInvites.email, email),
          eq(organisationInvites.organisationId, orgId),
          eq(organisationInvites.status, "pending"),
          gt(organisationInvites.expiresAt, new Date())
        )
      )
      .execute()
      .then((r) => r[0] ?? null);
  }

  // TODO could potentially be refactored to one query
  const [existingMember, existingInvite] = await Promise.all([
    existingOrgMembership(),
    existingPendingInvite(),
  ]);

  if (existingMember) {
    return result.fail(new CodedError("MemberAlreadyExists"));
  }

  if (existingInvite) {
    return result.fail(new CodedError("InviteAlreadyExists"));
  }

  const inviteResult = await db
    .insert(organisationInvites)
    .values({
      email: email,
      organisationId: orgId,
      invitedByUserId: invitedByUserId,
      token: generateId(40),
      expiresAt: createDate(new TimeSpan(1, "d")),
    })
    .returning({ inviteToken: organisationInvites.token })
    .then((r) => r[0] ?? null);

  if (!inviteResult) {
    throw new Error("Error creating invite");
  }

  return result.success(inviteResult);
}

export async function listPendingInvites({ orgId }: { orgId: string }) {
  return db
    .select({
      email: organisationInvites.email,
      expiresAt: organisationInvites.expiresAt,
      invitedAt: organisationInvites.invitedAt,
    })
    .from(organisationInvites)
    .where(
      and(
        eq(organisationInvites.organisationId, orgId),
        eq(organisationInvites.status, "pending"),
        gt(organisationInvites.expiresAt, new Date())
      )
    )
    .execute()
    .then((result) => result);
}

/**
 * Gets organisation details by a valid invite token
 */
export async function byInviteToken({
  inviteToken,
  invitedEmail,
}: {
  inviteToken: string;
  invitedEmail: string;
}) {
  return db
    .select({ name: organisations.name, slug: organisations.slug })
    .from(organisations)
    .innerJoin(organisationInvites, eq(organisations.id, organisationInvites.organisationId))
    .where(
      and(
        eq(organisationInvites.status, "pending"),
        gt(organisationInvites.expiresAt, new Date()),
        eq(organisationInvites.token, inviteToken),
        eq(organisationInvites.email, invitedEmail)
      )
    )
    .execute()
    .then((r) => r[0] ?? null);
}

/**
 * Accepts an invitation to join an organisation.
 * Validates the invite token is valid.
 */
export async function acceptInvitation({
  inviteToken,
  loggedInUser,
}: {
  inviteToken: string;
  loggedInUser: {
    email: string;
    id: string;
  };
}) {
  const token = await db
    .select()
    .from(organisationInvites)
    .where(eq(organisationInvites.token, inviteToken))
    .execute()
    .then((r) => r[0] ?? null);

  if (!token) {
    return result.fail(new CodedError("TokenNotFound"));
  }

  if (token.status !== "pending") {
    return result.fail(new CodedError("TokenExpired"));
  }

  if (token.expiresAt < new Date()) {
    return result.fail(new CodedError("TokenExpired"));
  }

  if (token.email !== loggedInUser.email) {
    return result.fail(new CodedError("EmailMismatch"));
  }

  // TODO this should be in a transaction but the Neon serverless driver doesn't currently support it
  await db
    .insert(members)
    .values({ organisationId: token.organisationId, userId: loggedInUser.id });

  await db
    .update(organisationInvites)
    .set({ status: "used", acceptedAt: new Date() })
    .where(eq(organisationInvites.token, inviteToken));

  return result.success(true);
}

export async function listMembers({ orgId }: { orgId: string }) {
  return db
    .select({
      id: members.id,
      userId: members.userId,
      email: users.email,
      role: members.organisationRole,
      joinedAt: members.createdAt,
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.organisationId, orgId))
    .execute()
    .then((r) => r ?? null);
}
