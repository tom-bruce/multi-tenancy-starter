export * as Password from "./password";

export async function hash(password: string) {
  return new (await import("oslo/password")).Argon2id().hash(password);
}

export async function verify({ password, hash }: { password: string; hash: string }) {
  return new (await import("oslo/password")).Argon2id().verify(hash, password);
}
