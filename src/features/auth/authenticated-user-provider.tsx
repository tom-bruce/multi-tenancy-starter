import { RouterOutput, trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useEffect } from "react";
import { SIGN_IN_URL, VERIFY_EMAIL_URL } from "./config";
import { PageLoader } from "@/components/page-loader";

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
      <VerifiedEmailGuard>{children}</VerifiedEmailGuard>
    </authenticatedAuthContext.Provider>
  );
};

function VerifiedEmailGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthenticatedUser();
  const router = useRouter();
  const isVerifiedPage = router.pathname === VERIFY_EMAIL_URL;
  const shouldRedirect = !isVerifiedPage && !user.verifiedAt;
  useEffect(() => {
    if (shouldRedirect) {
      const url = new URL(VERIFY_EMAIL_URL, window.location.origin);
      url.searchParams.set("returnUrl", router.asPath);
      router.push(url);
    }
    if (isVerifiedPage && user.verifiedAt) {
      const returnUrl = router.query.returnUrl;
      if (typeof returnUrl === "string") {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    }
  }, [isVerifiedPage, router, shouldRedirect, user.verifiedAt]);
  if (shouldRedirect) {
    return null;
  }
  return children;
}

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const query = trpc.user.me.useQuery(undefined, { retry: false });

  if (query.isLoading) {
    return <PageLoader />;
  }
  if (query.isError) {
    return <div>An error occured</div>;
  }

  if (!query.data) {
    // TODO this shouldn't happen - this seems to be an issue with the useQuery typings
    console.error("An error occurred loading user profile.");
    return null;
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
