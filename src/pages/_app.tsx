import { trpc } from "@/lib/trpc/next-client";
import { AppType } from "next/app";
import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
