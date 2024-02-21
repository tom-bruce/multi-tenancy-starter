import { trpc } from "@/lib/trpc/next-client";
import { verifyResetTokenSchema } from "./schemas";
import { useRouter } from "next/router";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { RESET_TOKEN_ERRORS } from "./config";

export function ResetPasswordWithTokenForm({ token }: { token: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const setPasswordMutation = trpc.user.verifyResetToken.useMutation({
    onSuccess: () => {
      qc.removeQueries();
      router.push("/");
    },
    onError: (error) => {
      if (Object.values(RESET_TOKEN_ERRORS).includes(error.message)) {
        form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "An unexpected error occurred. Please try again." });
      }
    },
  });
  const form = useZodForm(verifyResetTokenSchema.pick({ newPassword: true }), {
    defaultValues: { newPassword: "" },
  });
  const onSubmit = form.handleSubmit((data) =>
    setPasswordMutation.mutate({ newPassword: data.newPassword, token })
  );
  return (
    <Form {...form}>
      <form className="space-y-2" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your New Password"
                  disabled={setPasswordMutation.isPending || setPasswordMutation.isSuccess}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <Button
          className="w-full"
          disabled={setPasswordMutation.isSuccess}
          isLoading={setPasswordMutation.isPending}
        >
          Set Password
        </Button>
      </form>
    </Form>
  );
}
