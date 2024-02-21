import { Button } from "@/components/ui/button";
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
import { useZodForm } from "@/components/ui/use-zod-form";
import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { signUpSchema } from "./schemas";
import { useQueryClient } from "@tanstack/react-query";
import { SIGN_IN_ERRORS, VERIFY_EMAIL_URL } from "./config";
import { isRateLimited } from "./is-rate-limited";

export function SignInForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const signInMutation = trpc.user.signIn.useMutation({
    onSuccess: ({ isEmailVerified }) => {
      qc.removeQueries();
      const returnUrl = router.query.returnUrl;

      if (!isEmailVerified) {
        const url = new URL(VERIFY_EMAIL_URL, window.location.origin);
        if (typeof returnUrl === "string") {
          url.searchParams.set("returnUrl", returnUrl);
        }
        router.push(url);
      } else {
        const url = new URL(
          typeof returnUrl === "string" ? returnUrl : "/",
          window.location.origin
        );
        router.push(url);
      }
    },
    onError: (error) => {
      if (isRateLimited(error)) {
        form.setError("root", { message: "Login limit exceeded, please try again soon." });
      } else if (error.message === SIGN_IN_ERRORS.INVALID_CREDENTIALS) {
        form.setError("root", { message: SIGN_IN_ERRORS.INVALID_CREDENTIALS });
      } else if (error.message === SIGN_IN_ERRORS.USER_LINKED_WITH_ANOTHER_ACCOUNT) {
        form.setError("root", { message: SIGN_IN_ERRORS.USER_LINKED_WITH_ANOTHER_ACCOUNT });
      } else {
        form.setError("root", { message: "An unexpected error occurred. Please try again." });
      }
    },
  });
  const form = useZodForm(signUpSchema, { defaultValues: { email: "", password: "" } });
  const onSubmit = form.handleSubmit((data) => {
    signInMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input autoFocus type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input placeholder="Your Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <Button
          disabled={signInMutation.isSuccess}
          isLoading={signInMutation.isPending}
          className="w-full"
          type="submit"
        >
          Sign In with Email
        </Button>
      </form>
    </Form>
  );
}
