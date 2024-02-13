import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z.string().min(1),
});

export const baseOrgInputSchema = z.object({ orgSlug: z.string() });

export const inviteSchema = z.object({ email: z.string().email() });
