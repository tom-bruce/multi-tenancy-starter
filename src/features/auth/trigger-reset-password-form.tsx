import { trpc } from "@/lib/trpc/next-client";
import { resetPasswordSchema } from "./schemas";
import { useZodForm } from "@/components/ui/use-zod-form";
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

export function TriggerResetPasswordForm() {
  const resetPasswordMutation = trpc.user.triggerResetPassword.useMutation();

  const form = useZodForm(resetPasswordSchema, { defaultValues: { email: "" } });
  const onSubmit = form.handleSubmit((data) => resetPasswordMutation.mutate(data));
  return (
    <Form {...form}>
      <form noValidate onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Input
                    disabled={resetPasswordMutation.isPending || resetPasswordMutation.isSuccess}
                    type="email"
                    {...field}
                  />
                  <Button
                    isLoading={resetPasswordMutation.isPending}
                    disabled={resetPasswordMutation.isSuccess}
                    type="submit"
                  >
                    Reset
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        {resetPasswordMutation.isSuccess ? (
          <p className="text-sm font-medium text-green-500">
            An email with further instructions has been sent to{" "}
            {resetPasswordMutation.variables.email}.
          </p>
        ) : null}
      </form>
    </Form>
  );
}
