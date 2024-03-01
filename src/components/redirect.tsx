import { useRouter } from "next/router";
import { useEffect } from "react";

export function Redirect({ url }: { url: URL }) {
  const router = useRouter();
  useEffect(() => {
    router.push(url);
  }, [router, url]);
  return null;
}
