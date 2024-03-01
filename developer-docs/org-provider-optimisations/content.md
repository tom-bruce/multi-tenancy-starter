# OrganisationProvider Waterfall

(Note: these are quick notes that I have token while tossing up design decisions. They are not highly refined thoughts so some explainations + justifications may be lacking)

On the frontend, each page under the /app/[orgSlug]/\* route is an organisation route. Before any page is rendered, we want to verify that the logged in user has an active membership in the requested organisation.

To achieve this, we have implemented an OrganisationProvider which wraps the layout. When the page is loaded, the OrganisationProvider will verify the membership.

In the initial implementation, the OrganisationProvider is a child of the AuthenticatedProvider which suspends the rendering of the layout until the user's session is confirmed.

Although this implementation is composable and relatively easy to reason about, it leads to a request waterfall as the AuthenticatedProvider first verifies the session before rendering the OrganisationProvider which verifies the organisation membership (see the before screenshot). As this is a hot route that will be loaded when any organisation links are clicked, it is worthwhile to optimise this.

## Approaches

With the current session-based authentication architecture, each request for user data must make a round trip to the database to fetch data. This approach adds extra latency to each authenticated request compared with a token based architecutre. In return we have a simplier time updating user data, roles, membership and revoking access. One obvious approach to improving the OrganisationProvider performance would be to migrate to token based authentication. This has a number of downsides as mentioned. I think with the correct optimisations the performance impact of session-based authentication can be mitigated.

We considered two approaches to improve the session-based performance.

1. Server-side add organisation membership info to the session.
2. Keep the session information lean and parallise requests.

Extending the session with membership information would be the simplest way to remove the request waterfall from the client as the joining of data would be done on the server. One downside to this that we currently don't have any concept of user vs membership sessions.
This means that every request, regardless of whether it is an organisation level request could potentially have membership information. This adds complexity to session management and would dramatically increase the number of sessions a user might have active. It is not entirely uncommon for this type of authentication implementation, however acceptable user performance can likely be obtained through less destructive measures.

Parallising requests requires more work on the client side but allows our backend architecture to remain unchanged. This is likely to provide the best end user performance while requiring the least amount of re-architecting. I believe this is the best first step to take to address the performance issue. Later down the line we can always re-architect on the server side if parallising requests is no longer sufficient in achieving desired performance metrics. Furthermore, as our frontend architecture is using contexts to distribute the authenticated user and current organisation data, refactoring at the provider level will not require sweeping changes across the frontend to achieve high parallelism.

## Results

By parallelising requests for session and organisation membership, tRPC is able to batch both calls into a single network request (an added benefit of less function calls).

Before
user.me 89ms
organisation.bySlug 148ms
total 237ms

After
user.me,organisation.bySlug (batched) 104ms
total 104ms
improvement 133ms

56% reduction in time to interactive by parallising requests. Refactoring the OrganisationProvider has enabled parallel processing and batching of requests to the server. It is interesting that the first organisation.bySlug call takes longer than the total combined request time after refactor. I suspect this is due to network volatility, ideally I would like to retest that. In any case, it is clear when comparing to the prior user.me query that parallism has improved performance.

Further improvements could likely be made down the line by looking at database queries and the server side request flow.
