import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { signUpSchema } from "./schemas";
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
import { SIGN_UP_ERRORS, VERIFY_EMAIL_URL } from "./config";
import { useQueryClient } from "@tanstack/react-query";
import { isRateLimited } from "../errors/is-rate-limited";

export function SignUpForm() {
  const router = useRouter();

  const qc = useQueryClient();
  const signUpMutation = trpc.user.signUp.useMutation({
    onSuccess: () => {
      qc.removeQueries();
      const returnUrl = router.query.returnUrl;
      const url = new URL(VERIFY_EMAIL_URL, window.location.origin);
      if (typeof returnUrl === "string") {
        url.searchParams.set("returnUrl", returnUrl);
      }
      router.push(url);
    },
    onError: (error) => {
      if (isRateLimited(error)) {
        form.setError("root", {
          message: "Sign up limit exceeded. Please try again soon.",
        });
      } else if (error.message === SIGN_UP_ERRORS.EMAIL_IN_USE) {
        form.setError("email", { message: SIGN_UP_ERRORS.EMAIL_IN_USE });
      } else {
        form.setError("root", { message: "An unexpected error occurred. Please try again." });
      }
    },
  });

  const form = useZodForm(signUpSchema, { defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit((data) => {
    signUpMutation.mutate(data);
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
          disabled={signUpMutation.isSuccess}
          isLoading={signUpMutation.isPending}
          className="w-full"
          type="submit"
        >
          Sign up
        </Button>
      </form>
    </Form>
  );
}
