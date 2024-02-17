import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === "GET") {
    return NextResponse.next();
  }
  /*
   * Technically Origin headers can be spoofed by http clients.
   * CSRF is a browser based exploit which attempts to get users to unknowingly submit requests from another origin to this site.
   * The victim's browser is responsible for sending the Origin header which can't be modified by js.
   * This makes checking the Origin header secure for our use case here.
   */
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return NextResponse.next();
}
