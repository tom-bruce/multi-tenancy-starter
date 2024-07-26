import { AuthenticationRepository } from "@/domain/authentication/authentication.repository";
import { AuthenticationService } from "@/domain/authentication/authentication.service";
import { NextjsPagesApiCookieService } from "@/domain/cookie/cookie.service";
import { NoOpEmailService } from "@/domain/email/email.service";
import { UserRepository } from "@/domain/user/user.repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const emailService = new NoOpEmailService();
  const cookieService = new NextjsPagesApiCookieService(req, res);
  const userRepository = new UserRepository();
  const authenticationRepository = new AuthenticationRepository();

  const authenticationService = new AuthenticationService(
    authenticationRepository,
    userRepository,
    emailService,
    cookieService
  );

  //   const authRes = await authenticationService.signInWithEmail({
  //     email: "tbruc3@gmail.com",
  //     unhashedPassword: "Password",
  //   });

  //   await authenticationService.signOut();
  //   const result = await authenticationService.signUpWithEmail({
  //     email: "tbruc3+verify@gmail.com",
  //     unhashedPassword: "Password",
  //   });
  //   const result = await authenticationService.verifyEmailWithCode({ code: "02156166" });
  const result = await authenticationService.getUser();
  //   const result = await authenticationService.initiateEmailVerification();
  //   const result = await authenticationService.();
  console.log({ result });
  return res.status(200).json({ message: "Hello from Next.js!" });
}
