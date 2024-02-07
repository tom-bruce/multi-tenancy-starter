import { trpc } from "@/lib/trpc/next-client";
import { AppType } from "next/app";
import "@/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthenticationProvider } from "@/features/auth/authenticated-user-provider";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthenticationProvider>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </AuthenticationProvider>
  );
};
export default trpc.withTRPC(MyApp);
