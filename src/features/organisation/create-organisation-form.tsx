import { trpc } from "@/lib/trpc/next-client";
import { sluggify } from "@/lib/utils";
import { useState } from "react";

function useCreateOrganisationMutation() {
  const utils = trpc.useUtils();
  const mutation = trpc.organisation.create.useMutation({
    onSuccess: () => {
      utils.organisation.list.invalidate();
    },
  });
  return mutation;
}

export function CreateOrganisationForm() {
  const mutation = useCreateOrganisationMutation();
  const [name, setName] = useState("");
  return (
    <div>
      <h1>Create Organisation</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ name });
        }}
      >
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" />
        </label>
        <label>
          Slug
          <input readOnly disabled value={sluggify(name)} type="text" />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
