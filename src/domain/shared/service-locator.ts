// // Maps a service name to a service INTERFACE
type ServiceMap = {
  //   UserService: IUserService;
  //     TeamService: ITeamService;
  //   AuthenticationService: IAuthenticationService
};

type Service = keyof ServiceMap;

/**
 * The ServiceLocator class is responsible for initialising services within the application.
 */
class ServiceLocator {
  // Maps a service name to a concrete service IMPLEMENTATION
  // This could be improved by caching the creation of services and repositories
  private static _serviceFactory: { [K in Service]: () => ServiceMap[K] } = {
    // AuthenticationService: () => {
    //     return new AuthenticationService()
    // },
    // UserService: () => {
    //   const userRepo = new InMemoryUserRepository();
    //   return new UserService(userRepo);
    // },
  };

  static getService<K extends keyof ServiceMap>(name: K): ServiceMap[K] {
    const serviceFactory = ServiceLocator._serviceFactory[name]();
    if (!serviceFactory) {
      throw new Error(`Service ${name} not found.`);
    }

    return serviceFactory;
  }
}
