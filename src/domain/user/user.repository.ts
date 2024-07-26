import { UserDTO } from "@/domain/user/user.dto";
import { IUserRepository } from "@/domain/user/user.interface";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  async byEmail(email: string) {
    return db
      .select({
        id: users.id,
        email: users.email,
        // hashedPassword: users.hashedPassword,
        verifiedAt: users.verifiedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .execute()
      .then((result) => result[0] ?? null);
  }
  async byEmailWithPassword(email: string) {
    return db
      .select({
        id: users.id,
        email: users.email,
        hashedPassword: users.hashedPassword,
        verifiedAt: users.verifiedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .execute()
      .then((result) => result[0] ?? null);
  }

  async create({ email, hashedPassword }: { email: string; hashedPassword: string }) {
    const dbUser = await db
      .insert(users)
      .values({ email, hashedPassword })
      .returning({ id: users.id, verifiedAt: users.verifiedAt })
      .execute()
      .then((result) => result[0]);
    if (!dbUser) {
      throw new Error("Unknown error persisting user");
    }
    const result: UserDTO = { email: email, verifiedAt: dbUser.verifiedAt, id: dbUser.id };
    return result;
  }
}
