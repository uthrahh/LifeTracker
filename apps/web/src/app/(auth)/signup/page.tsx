"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/authSchemas";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }

    let session = data.session;
    if (!session) {
      // Autoconfirm is on (this app doesn't gate access behind email
      // verification), but /signup still doesn't hand back a session —
      // sign in immediately so the user never sees an unnecessary
      // "check your inbox" step for an account that's already usable.
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      session = signInData.session;
    }

    if (session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="animate-rise-in space-y-2 text-center">
        <h1 className="font-display text-2xl text-ink">Check your inbox</h1>
        <p className="text-sm text-ink-soft">We sent a confirmation link — open it to finish creating your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-rise-in">
      <div>
        <h1 className="font-display text-2xl text-ink">Start here</h1>
        <p className="text-sm text-ink-soft">One calm place for everything you&apos;re trying to improve.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField label="Name" autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
        <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="focus-ring font-medium text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
