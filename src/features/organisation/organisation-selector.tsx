import { Suspense, useState } from "react";
import { useOrganisation } from "./organisation-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { Icons } from "@/components/ui/icons";

export function OrganisationSelector() {
  const [open, setOpen] = useState(false);
  const activeOrg = useOrganisation();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select an organisation"
          className="w-[250px] justify-between"
        >
          <Avatar className="mr-2 h-6 w-6">
            <AvatarFallback>TO</AvatarFallback>
          </Avatar>
          {activeOrg.name}
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <OrganisationCommandList setOpen={setOpen} />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface OrganisationCommandListProps {
  setOpen: (open: boolean) => void;
}
function OrganisationCommandList({ setOpen }: OrganisationCommandListProps) {
  return (
    <CommandList>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-12">
            <Icons.spinner className="animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CommandInput placeholder="Search organisations..." />
        <CommandEmpty>No organisations found</CommandEmpty>
        <OrganisationCommandGroup setOpen={setOpen} />
      </Suspense>
    </CommandList>
  );
}

function OrganisationCommandGroup({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [orgs] = trpc.organisation.list.useSuspenseQuery();
  const router = useRouter();
  const currentOrg = useOrganisation();
  return (
    <CommandGroup>
      {orgs.map((org) => (
        <CommandItem
          key={org.id}
          onSelect={() => {
            router.push(`/app/${org.slug}`);
            setOpen(false);
          }}
          className="text-sm"
        >
          <Avatar className="mr-2 h-6 w-6">
            <AvatarFallback>{org.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {org.name}
          <CheckIcon
            className={cn(
              "ml-auto h-4 w-4",
              currentOrg.id === org.id ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
