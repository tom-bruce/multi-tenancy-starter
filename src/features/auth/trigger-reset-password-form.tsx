import { trpc } from "@/lib/trpc/next-client";
import { resetPasswordSchema } from "./schemas";

export function TriggerResetPasswordForm() {
  const resetPasswordMutation = trpc.user.triggerResetPassword.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = resetPasswordSchema.parse(
          Object.fromEntries(new FormData(e.target as any).entries())
        );
        resetPasswordMutation.mutate(data);
      }}
    >
      <input name="email" type="email" />
      {resetPasswordMutation.isSuccess ? (
        <p className="text-sm text-green-600">
          Further instructions on reseting your password have been emailed to you.
        </p>
      ) : null}
      <button
        disabled={resetPasswordMutation.isPending || resetPasswordMutation.isSuccess}
        type="submit"
      >
        Reset password
      </button>
    </form>
  );
}
