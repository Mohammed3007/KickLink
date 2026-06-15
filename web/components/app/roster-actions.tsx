"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, UserCheck, UserX } from "lucide-react";
import { markPaid, recordAttendance, removePlayer } from "@/lib/actions/manage";

export function RosterActions({
  registrationId,
  showMarkPaid,
  attendanceStatus,
}: {
  registrationId: string;
  showMarkPaid: boolean;
  attendanceStatus?: "PRESENT" | "NO_SHOW" | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  if (pending) {
    return <Loader2 className="size-4 animate-spin text-ink-3" />;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {attendanceStatus && (
        <span
          className={
            attendanceStatus === "PRESENT"
              ? "rounded-lg bg-ok-bg px-2.5 py-1.5 text-xs font-semibold text-ok"
              : "rounded-lg bg-bad-bg px-2.5 py-1.5 text-xs font-semibold text-bad"
          }
        >
          {attendanceStatus === "PRESENT" ? "Present" : "No-show"}
        </span>
      )}
      {showMarkPaid && (
        <button
          onClick={() => run(() => markPaid(registrationId))}
          className="flex items-center gap-1 rounded-lg bg-ok-bg px-2.5 py-1.5 text-xs font-semibold text-ok transition-opacity hover:opacity-80"
        >
          <Check className="size-3.5" /> Mark paid
        </button>
      )}
      <button
        onClick={() => run(() => recordAttendance(registrationId, "PRESENT"))}
        className="flex items-center gap-1 rounded-lg bg-ok-bg px-2.5 py-1.5 text-xs font-semibold text-ok transition-opacity hover:opacity-80"
      >
        <UserCheck className="size-3.5" /> Present
      </button>
      <button
        onClick={() => run(() => recordAttendance(registrationId, "NO_SHOW"))}
        className="flex items-center gap-1 rounded-lg bg-bad-bg px-2.5 py-1.5 text-xs font-semibold text-bad transition-opacity hover:opacity-80"
      >
        <UserX className="size-3.5" /> No-show
      </button>
      <button
        onClick={() => run(() => removePlayer(registrationId))}
        aria-label="Remove player"
        className="flex size-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-bad-bg hover:text-bad"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
