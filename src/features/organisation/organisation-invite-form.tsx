import { useZodForm } from "@/components/ui/use-zod-form";
import { inviteSchema } from "./schemas";
import { trpc } from "@/lib/trpc/next-client";
import { useOrganisationSlug } from "./use-organisation-slug";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INVITE_ERRORS } from "./config";

export function OrganisationInviteForm() {
  const orgSlug = useOrganisationSlug();
  const form = useZodForm(inviteSchema, { defaultValues: { email: "" } });
  const utils = trpc.useUtils();
  const inviteMutation = trpc.organisation.invite.useMutation({
    onSuccess: () => {
      utils.organisation.invites.invalidate({ orgSlug });
      form.reset();
    },
    onError: (error) => {
      if (Object.values(INVITE_ERRORS).includes(error.message)) {
        form.setError("email", { message: error.message });
      } else {
        form.setError("root", { message: "An unexpected error occurred" });
      }
    },
  });
  const onSubmit = form.handleSubmit((values) => {
    inviteMutation.mutate({ orgSlug, email: values.email });
  });
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="someone@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <Button isLoading={inviteMutation.isPending} type="submit">
          Invite Member
        </Button>
      </form>
    </Form>
  );
}
