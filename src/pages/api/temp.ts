import { ServiceLocator } from "@/domain/shared/service-locator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const locator = ServiceLocator.createNextjsServiceLocator(req, res);
  const authenticationService = locator.getService("AuthenticationService");

  const result = await authenticationService.getUser();
  // const result = await authenticationService.signInWithEmail({
  //   email: "tbruc3@gmail.com",
  //   unhashedPassword: "Password",
  // });
  console.log({ result });
  return res.status(200).json({ message: "Hello from Next.js!" });
}
