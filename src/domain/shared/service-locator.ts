import { IAuthenticationService } from "@/domain/authentication/authentication.interface";
import { AuthenticationRepository } from "@/domain/authentication/authentication.repository";
import { AuthenticationService } from "@/domain/authentication/authentication.service";
import { ICookieService } from "@/domain/cookie/cookie.interface";
import { NextjsPagesApiCookieService } from "@/domain/cookie/cookie.service";
import { IEmailService } from "@/domain/email/email.interface";
import { ResendEmailService } from "@/domain/email/email.service";
import { UserRepository } from "@/domain/user/user.repository";
import { NextApiRequest, NextApiResponse } from "next";

// // Maps a service name to a service INTERFACE
type ServiceMap = {
  AuthenticationService: IAuthenticationService;
  CookieService: ICookieService;
  EmailService: IEmailService;

  //   AuthenticationService: IAuthenticationService
};

type Service = keyof ServiceMap;

interface IServiceLocator {
  getService<K extends keyof ServiceMap>(name: K): ServiceMap[K];
}
/**
 * The ServiceLocator class is responsible for initialising services within the application.
 */
export class ServiceLocator implements IServiceLocator {
  // Maps a service name to a concrete service IMPLEMENTATION
  // This could be improved by caching the creation of services and repositories
  private _serviceFactory: { [K in Service]: () => ServiceMap[K] };
  constructor(serviceFactory: { [K in Service]: () => ServiceMap[K] }) {
    this._serviceFactory = serviceFactory;
  }

  static createNextjsServiceLocator(req: NextApiRequest, res: NextApiResponse): ServiceLocator {
    // TODO we should look at having a repository/service cache to reuse the same service instances
    return new ServiceLocator({
      EmailService: () => new ResendEmailService(),
      AuthenticationService: () => {
        const authenticationRepository = new AuthenticationRepository();
        const userRepository = new UserRepository();
        const cookieService = new NextjsPagesApiCookieService(req, res);
        const emailService = new ResendEmailService();
        return new AuthenticationService(
          authenticationRepository,
          userRepository,
          emailService,
          cookieService
        );
      },
      CookieService: () => new NextjsPagesApiCookieService(req, res),
    });
  }

  getService<K extends keyof ServiceMap>(name: K): ServiceMap[K] {
    const serviceFactory = this._serviceFactory[name]();
    if (!serviceFactory) {
      throw new Error(`Service ${name} not found.`);
    }

    return serviceFactory;
  }
}
