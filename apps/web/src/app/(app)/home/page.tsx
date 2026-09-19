import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: envPrefs }, { data: settings }, { data: defaultQuotes }, { data: userQuotes }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("environment_preferences").select("*").eq("user_id", user.id).single(),
      supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("quotes").select("text, author"),
      supabase.from("user_quotes").select("text, author").eq("user_id", user.id).eq("enabled", true),
    ]);

  const quotes = [...(defaultQuotes ?? []), ...(userQuotes ?? [])];

  return (
    <HomeClient
      userId={user.id}
      fullName={profile?.full_name ?? "there"}
      scene={envPrefs?.scene ?? "fields"}
      timeMode={envPrefs?.time_mode ?? "auto"}
      showQuotes={settings?.show_quotes_on_home ?? true}
      quotes={quotes}
    />
  );
}
