import { ICookie, ICookieService } from "@/domain/cookie/cookie.interface";
import { NextApiRequest, NextApiResponse } from "next";

export class NextjsPagesApiCookieService implements ICookieService {
  constructor(private req: NextApiRequest, private res: NextApiResponse) {}
  getAll() {
    return Object.keys(this.req.cookies).map((name) => ({
      name,
      value: this.req.cookies[name] || "",
      attributes: {}, //TODO need to work this out
    }));
  }
  getRaw() {
    return this.req.headers.cookie ?? "";
  }

  set(serializedCookie: string): void {
    this.res.appendHeader("Set-Cookie", serializedCookie);
  }
}
