import { ReactNode } from "react";
import { AuthenticationProvider } from "./authenticated-user-provider";

export function DefaultLayout({ children }: { children: ReactNode }) {
  return <AuthenticationProvider>{children}</AuthenticationProvider>;
}
