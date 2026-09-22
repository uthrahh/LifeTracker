"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ONBOARDING_FOCUS_AREAS, ENVIRONMENTS } from "@wayfare/config";
import type { EnvironmentScene } from "@wayfare/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Card } from "@/components/ui/Card";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [scene, setScene] = useState<EnvironmentScene>("fields");
  const [firstGoal, setFirstGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function toggleFocus(area: string) {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  async function finish() {
    setIsSubmitting(true);
    setSubmitError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      setSubmitError("Your session expired — please sign in again.");
      router.push("/login");
      return;
    }

    const { error: envError } = await supabase
      .from("environment_preferences")
      .upsert({ user_id: user.id, scene, time_mode: "auto" });
    if (envError) {
      setIsSubmitting(false);
      setSubmitError(envError.message);
      return;
    }

    if (firstGoal.trim()) {
      const { error: goalError } = await supabase.from("goals").insert({
        user_id: user.id,
        title: firstGoal.trim(),
        type: "short_term",
        status: "active",
      });
      if (goalError) {
        setIsSubmitting(false);
        setSubmitError(goalError.message);
        return;
      }
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md py-10 animate-rise-in">
      {step === 1 && (
        <Card>
          <h1 className="font-display text-2xl text-ink">What matters most to you right now?</h1>
          <p className="mt-1 text-sm text-ink-soft">Pick a few — you can change these anytime.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {ONBOARDING_FOCUS_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocus(area)}
                className={clsx(
                  "focus-ring rounded-full border px-4 py-2 text-sm transition-colors",
                  focusAreas.includes(area) ? "border-accent bg-accent text-paper" : "border-border text-ink-soft hover:border-accent/60",
                )}
              >
                {area}
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full" disabled={focusAreas.length === 0} onClick={() => setStep(2)}>
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h1 className="font-display text-2xl text-ink">How do you want your space to feel?</h1>
          <p className="mt-1 text-sm text-ink-soft">You can switch anytime in Settings.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env.scene}
                type="button"
                onClick={() => setScene(env.scene)}
                className={clsx(
                  "focus-ring rounded-xl2 border p-4 text-left transition-colors",
                  scene === env.scene ? "border-accent bg-accent/10" : "border-border hover:border-accent/60",
                )}
              >
                <p className="font-display text-base text-ink">{env.label}</p>
                <p className="text-xs text-ink-faint">{env.description}</p>
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={() => setStep(3)}>
            Continue
          </Button>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h1 className="font-display text-2xl text-ink">What&apos;s one thing you want to move forward?</h1>
          <p className="mt-1 text-sm text-ink-soft">We&apos;ll turn it into your first goal.</p>
          <div className="mt-5">
            <TextField
              label="Goal"
              placeholder="e.g. Get fit, Learn to invest, Land an internship"
              value={firstGoal}
              onChange={(e) => setFirstGoal(e.target.value)}
            />
          </div>
          {submitError ? <p className="mt-3 text-sm text-red-500">{submitError}</p> : null}
          <Button className="mt-6 w-full" disabled={isSubmitting} onClick={finish}>
            {isSubmitting ? "Setting things up…" : "Enter Wayfare"}
          </Button>
        </Card>
      )}
    </div>
  );
}
