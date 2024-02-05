import { trpc } from "@/lib/trpc/next-client";
import { AppType } from "next/app";
import "@/styles/globals.css";
import { AuthenticationProvider } from "@/features/auth/authenticated-user-provider";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthenticationProvider>
      <Component {...pageProps} />;
    </AuthenticationProvider>
  );
};
export default trpc.withTRPC(MyApp);
