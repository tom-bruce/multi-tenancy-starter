import { AuthenticatedLayout } from "@/features/auth/authenticated-layout";

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <ProfilePageInner />
    </AuthenticatedLayout>
  );
}
function ProfilePageInner() {
  return <h1>Mock Profile Page</h1>;
}
