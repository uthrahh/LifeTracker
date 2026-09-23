"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createGoalSchema, type CreateGoalInput } from "@wayfare/validation";
import { createClient } from "@/lib/supabase/client";
import { createGoal } from "@/lib/queries/goals";
import { fetchCategories } from "@/lib/queries/categories";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function NewGoalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      return fetchCategories(supabase, user.id);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalInput>({ resolver: zodResolver(createGoalSchema), defaultValues: { type: "short_term" } });

  async function onSubmit(values: CreateGoalInput) {
    setServerError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const goal = await createGoal(supabase, user.id, values);
      router.push(`/goals/${goal.id}`);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Couldn't create that goal.");
    }
  }

  return (
    <div className="mx-auto max-w-lg animate-rise-in">
      <h1 className="font-display text-2xl text-ink">New goal</h1>
      <Card className="mt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <TextField label="Title" placeholder="e.g. Get a software engineering internship" {...register("title")} error={errors.title?.message} />
          <Textarea label="Description" placeholder="Optional" {...register("description")} error={errors.description?.message} />
          <Select label="Type" {...register("type")}>
            <option value="short_term">Short-term</option>
            <option value="long_term">Long-term</option>
          </Select>
          {categories && categories.length > 0 && (
            <Select label="Category" {...register("categoryId")}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Start date" type="date" {...register("startDate")} error={errors.startDate?.message} />
            <TextField label="Target date" type="date" {...register("targetDate")} error={errors.targetDate?.message} />
          </div>
          {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create goal"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
