import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HabitsClient } from "./HabitsClient";

export default async function HabitsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <HabitsClient userId={user.id} />;
}
