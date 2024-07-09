# Multi-tenancy Starter Kit

I have commercial experience working with [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations). I've found it to be prohibitively expensive to adopt for personal/start-up projects. The last time I worked with it, there were also some use cases around membership management which hadn't been addressed.

This project is a starter template that I have created for my multi-tenant personal projects. It is also an exploration of the considerations and trade-offs that exist when architecting secure multi-tenant authentication and authorisation.

It is uses the following technologies:

- [Next.js Pages Router](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for styling
- [tRPC](https://trpc.io/) for client-server communication
- PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) via the Neon Serverless Driver
- Rate Limiting with Redis
- [Lucia Auth](https://lucia-auth.com/) as a low-level library for handling authentication
- [Resend](https://resend.com/) & [React Email](https://react.email/) for email communication
