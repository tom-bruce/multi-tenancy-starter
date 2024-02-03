import { IncomingMessage, ServerResponse } from "http";
import { User, Session } from "lucia";
import { lucia } from "./auth";

export async function validateRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<{ user: User; session: Session } | { user: null; session: null }> {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }
  const result = await lucia.validateSession(sessionId);
  if (result.session && result.session.fresh) {
    res.appendHeader("Set-Cookie", lucia.createSessionCookie(result.session.id).serialize());
  }
  if (!result.session) {
    res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  }
  return result;
}
