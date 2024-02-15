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
import { SIGN_UP_ERRORS } from "./config";
import { useQueryClient } from "@tanstack/react-query";

export function SignUpForm() {
  const router = useRouter();

  const qc = useQueryClient();
  const signUpMutation = trpc.user.signUp.useMutation({
    onSuccess: () => {
      qc.removeQueries();
      const returnUrl = router.query.returnUrl;
      if (typeof returnUrl === "string") {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    },
    onError: (error) => {
      if (error.message === SIGN_UP_ERRORS.EMAIL_IN_USE) {
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
      <form className="max-w-2xl mx-auto space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <Button type="submit">Sign up</Button>
      </form>
    </Form>
  );
}
