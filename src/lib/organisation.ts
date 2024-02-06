import { eq } from "drizzle-orm";
import { db } from "./db";
import { members } from "./db/schema/members";
import { organisations } from "./db/schema/organisations";

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
    .values({ userId: ownerId, organisationId: newOrg.id })
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
    .select()
    .from(members)
    .innerJoin(organisations, eq(members.organisationId, organisations.id))
    .where(eq(members.userId, userId))
    .execute();
  return orgList;
  // .then((result) => result.map((row) => row.organisationId));
}
