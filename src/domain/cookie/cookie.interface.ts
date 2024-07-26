interface ICookieAttributes {
  secure?: boolean;
  path?: string;
  domain?: string;
  sameSite?: "lax" | "strict" | "none";
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
}
// Interface inspired by https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
export interface ICookie {
  name: string;
  value: string;
  attributes: ICookieAttributes;
}
export interface ICookieService {
  getRaw(): string;
  getAll(): Array<ICookie>;
  //   setAll(cookies: Array<ICookie>): void;
  set(serializedCookie: string): void;
}
