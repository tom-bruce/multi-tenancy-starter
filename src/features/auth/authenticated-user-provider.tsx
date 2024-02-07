import { RouterOutput, trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useEffect } from "react";
import { SIGN_IN_URL } from "./config";
import { getBaseUrl } from "@/lib/utils";

type AuthUser = NonNullable<RouterOutput["user"]["me"]["user"]>;

type AuthenticationContext = {
  user: AuthUser | null;
};

type AuthenticatedUserContext = {
  user: AuthUser;
};

const authenticatedAuthContext = createContext<AuthenticatedUserContext>(
  {} as AuthenticatedUserContext
);
const authContext = createContext<AuthenticationContext>({} as AuthenticationContext);

export const AuthenticatedProvider = ({ children }: { children: ReactNode }) => {
  const auth = useUser();
  const router = useRouter();
  useEffect(() => {
    if (auth.user === null) {
      const url = new URL(SIGN_IN_URL, window.location.origin);
      url.searchParams.set("returnUrl", router.asPath);
      router.push(url);
    }
  }, [auth.user, router]);
  if (auth.user === null) {
    // TODO this should probably show either an error screen or redirect to login. The purpose of this provider is to allow for the more strictly typed useAuthenticatedUser hook
    return null;
  }
  return (
    <authenticatedAuthContext.Provider value={{ user: auth.user }}>
      {children}
    </authenticatedAuthContext.Provider>
  );
};

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const query = trpc.user.me.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (query.isError || query.data === null) {
      router.push(SIGN_IN_URL);
    }
  }, [query.data, query.isError, router]);

  if (query.isLoading) {
    return <div>Performing Auth Check...</div>;
  }
  if (query.isError) {
    return <div>An error occured</div>;
  }
  if (query.data === undefined) {
    // TODO this shouldn't happen - this seems to be an issue with the useQuery typings
    throw new Error("An error occurred loading user profile.");
  }
  return <authContext.Provider value={query.data}>{children}</authContext.Provider>;
};

export function useUser() {
  const ctx = useContext(authContext);
  if (!ctx) {
    throw new Error("useUser must be used within AuthenticationProvider");
  }
  return ctx;
}

export function useAuthenticatedUser() {
  const ctx = useContext(authenticatedAuthContext);
  if (!ctx) {
    throw new Error("useAuthenticatedUser must be used within AuthenticatedUserProvider");
  }
  return ctx;
}
