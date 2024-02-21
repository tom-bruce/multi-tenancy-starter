import { Icons } from "./ui/icons";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Icons.spinner className="animate-spin text-muted-foreground h-12 w-12" />
    </div>
  );
}
