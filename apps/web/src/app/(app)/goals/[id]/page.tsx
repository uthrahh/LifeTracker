import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalDetailClient } from "./GoalDetailClient";

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <GoalDetailClient userId={user.id} goalId={params.id} />;
}
