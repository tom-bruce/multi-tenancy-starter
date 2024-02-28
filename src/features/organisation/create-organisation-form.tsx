import { useZodForm } from "@/components/ui/use-zod-form";
import { trpc } from "@/lib/trpc/next-client";
import { sluggify } from "@/lib/utils";
import { useEffect } from "react";
import { createOrganisationSchema } from "./schemas";
import { useRouter } from "next/router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { isRateLimited } from "../errors/is-rate-limited";
import { CREATE_ORGANISATION_ERRORS } from "./config";

export function CreateOrganisationForm() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.organisation.create.useMutation({
    onSuccess: (data) => {
      utils.organisation.list.invalidate();
      router.push(`/app/${data.slug}`);
    },
    onError: (error) => {
      if (isRateLimited(error)) {
        form.setError("root", { message: "Request limit exceeded, please try again soon." });
      } else if (error.message === CREATE_ORGANISATION_ERRORS.ORGANISATION_ALREADY_EXISTS) {
        form.setError("name", { message: CREATE_ORGANISATION_ERRORS.ORGANISATION_ALREADY_EXISTS });
      } else {
        form.setError("root", { message: "An unexpected error occurred. Please try again." });
      }
    },
  });

  const form = useZodForm(createOrganisationSchema.extend({ slug: z.string() }), {
    defaultValues: { name: "", slug: "" },
  });
  const name = form.watch("name");
  useEffect(() => {
    form.setValue("slug", sluggify(name));
  }, [form, name]);
  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({ name: data.name });
  });
  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Organisation Name</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="Organisation Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Organisation Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-disabled
                  autoFocus
                  disabled
                  placeholder={sluggify("Organisation Slug")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          isLoading={mutation.isPending}
          disabled={mutation.isSuccess}
          className="w-full"
          type="submit"
        >
          Create Organisation
        </Button>
      </form>
    </Form>
  );
}
