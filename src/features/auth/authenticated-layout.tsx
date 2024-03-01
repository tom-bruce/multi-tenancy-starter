import { ReactNode } from "react";
import {
  AuthenticatedProvider,
  AuthenticationProvider,
  VerifiedEmailGuard,
} from "./authenticated-user-provider";

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticationProvider>
      <AuthenticatedProvider>
        <VerifiedEmailGuard>{children}</VerifiedEmailGuard>
      </AuthenticatedProvider>
    </AuthenticationProvider>
  );
}
