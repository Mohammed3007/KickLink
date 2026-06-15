"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfile, type ProfileState } from "@/lib/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6E3BD8",
  "#2666D6",
  "#12915A",
  "#D85A18",
  "#CF3A40",
  "#B7790E",
  "#0E8A86",
  "#8E44AD",
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" full size="lg" loading={pending}>
      Save profile
    </Button>
  );
}

export function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    city: string;
    skill: string;
    avatarColor: string;
  };
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-xl bg-ok-bg px-3.5 py-3 text-sm font-semibold text-ok">
          <CheckCircle2 className="size-4 shrink-0" />
          Profile saved
        </div>
      )}

      <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
        <Avatar name={user.name} color={user.avatarColor} size={56} />
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{user.name}</p>
          <p className="truncate text-sm text-ink-3">{user.email}</p>
        </div>
      </div>

      <Field label="Display name" htmlFor="name">
        <Input id="name" name="name" defaultValue={user.name} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" defaultValue={user.city} required />
        </Field>
        <Field label="Skill" htmlFor="skill">
          <Select id="skill" name="skill" defaultValue={user.skill} required>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Competitive</option>
          </Select>
        </Field>
      </div>

      <Field label="Avatar color" htmlFor="avatarColor">
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <label
              key={color}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-xl ring-1 ring-line",
                "has-[:checked]:ring-2 has-[:checked]:ring-brand-600"
              )}
              style={{ backgroundColor: color }}
            >
              <input
                className="sr-only"
                type="radio"
                name="avatarColor"
                value={color}
                defaultChecked={user.avatarColor === color}
              />
              <span className="size-3 rounded-full bg-white/90" />
            </label>
          ))}
        </div>
      </Field>

      <Submit />
    </form>
  );
}
