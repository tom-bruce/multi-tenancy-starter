import { useZodForm } from "@/components/ui/use-zod-form";
import { verifyEmailSchema } from "./schemas";
import { trpc } from "@/lib/trpc/next-client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isRateLimited } from "../errors/is-rate-limited";
import { VERIFY_EMAIL_ERRORS } from "./config";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function VerifyEmailForm() {
  const qc = useQueryClient();
  const router = useRouter();
  const form = useZodForm(verifyEmailSchema, { defaultValues: { code: "" } });
  const verifyMutation = trpc.user.verifyEmail.useMutation({
    onSuccess() {
      qc.removeQueries();
      const returnUrl = router.query.returnUrl;
      if (typeof returnUrl === "string") {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    },
    onError(e) {
      if (isRateLimited(e)) {
        form.setError("root", {
          message: "You've submitted too many codes. Please try again in a few minutes.",
        });
      } else if (Object.values(VERIFY_EMAIL_ERRORS).includes(e.message)) {
        form.setError("root", {
          message: e.message,
        });
      } else {
        form.setError("root", { message: "An error occured. Please try again" });
      }
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    verifyMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Code</FormLabel>
              <FormControl>
                <Input
                  disabled={verifyMutation.isPending || verifyMutation.isSuccess}
                  type="text"
                  placeholder="Code from your Email"
                  {...field}
                />
              </FormControl>
              <FormDescription>Do not share this code with anyone</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <Button
          isLoading={verifyMutation.isPending}
          disabled={verifyMutation.isSuccess}
          type="submit"
          className="w-full"
        >
          Verify Email
        </Button>
      </form>
      <ResendVerificationEmail />
    </Form>
  );
}

function ResendVerificationEmail() {
  const form = useZodForm(z.object({}));
  const resendMutation = trpc.user.sendEmailVerificationCode.useMutation({
    onError(error) {
      if (isRateLimited(error)) {
        const resetUnix = z.coerce.number().safeParse(error.shape?.ratelimit.reset);
        if (!resetUnix.success) {
          form.setError("root", {
            message: "A new code has recently been sent to your email. Please try again later.",
          });
          return;
        }
        const resetAt = new Date(resetUnix.data);
        const minutesUntilReset = Math.ceil(
          Math.ceil(Math.abs((resetAt.getTime() - new Date().getTime()) / 1000 / 60))
        );
        form.setError("root", {
          message: `You have only recently requested a new verification email. You must wait ${minutesUntilReset} minutes before trying again.`,
        });
      } else {
        form.setError("root", {
          message: "An unexpected error occurred",
        });
      }
    },
  });

  const onSubmit = form.handleSubmit(() => {
    resendMutation.mutate();
  });

  if (resendMutation.isSuccess) {
    return <p className="text-green-500">A new code has been sent to your registered email</p>;
  }
  return (
    <Form {...form}>
      <form className="max-w-2xl mx-auto" onSubmit={onSubmit}>
        <p className="text-muted-foreground flex items-center gap-2">
          Didn&apos;t recieve a code?{" "}
          <Button className="p-0" isLoading={resendMutation.isPending} variant="link" type="submit">
            Resend Verification Email
          </Button>
        </p>
        <FormRootMessage />
      </form>
    </Form>
  );
}
