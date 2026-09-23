import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalsListClient } from "./GoalsListClient";

export default async function GoalsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <GoalsListClient userId={user.id} />;
}
