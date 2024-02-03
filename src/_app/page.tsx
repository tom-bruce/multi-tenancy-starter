import { SignOutButton } from "@/features/auth/sign-out-button";
import { validateRequest } from "./auth/validate-request";
import { redirect } from "next/navigation";

export default async function Home() {
  const data = await validateRequest();
  if (!data.user) {
    return redirect("/auth/sign-in");
  }
  return (
    <div>
      <pre className="text-gray-800">{JSON.stringify(data, null, 2)}</pre>
      <SignOutButton />
    </div>
  );
}
