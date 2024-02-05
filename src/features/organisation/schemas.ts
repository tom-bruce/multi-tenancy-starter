import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z.string().min(1),
});
