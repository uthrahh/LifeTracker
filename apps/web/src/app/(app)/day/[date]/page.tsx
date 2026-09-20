import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DayClient } from "./DayClient";

export default async function DayPage({ params }: { params: { date: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <DayClient userId={user.id} date={params.date} />;
}
