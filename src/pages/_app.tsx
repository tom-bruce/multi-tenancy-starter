import { trpc } from "@/lib/trpc/next-client";
import { AppType } from "next/app";
import "@/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};
export default trpc.withTRPC(MyApp);
