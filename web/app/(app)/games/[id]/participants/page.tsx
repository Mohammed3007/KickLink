import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const game = await getGame(id, user.id);
  if (!game) notFound();

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title="Players" />
      <div className="space-y-4 px-4 pt-4">
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-3">
            Confirmed · {game.confirmed.length}/{game.capacity}
          </h2>
          <Card className="divide-y divide-line-2">
            {game.confirmed.map((r) => (
              <PersonRow
                key={r.id}
                name={r.user.name}
                color={r.user.avatarColor}
                you={r.userId === user.id}
                attendanceStatus={r.attendance?.status ?? null}
              />
            ))}
            {game.confirmed.length === 0 && (
              <p className="p-4 text-sm text-ink-3">No players yet.</p>
            )}
          </Card>
        </section>

        {game.waitlist.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-3">
              Waitlist · {game.waitlist.length}
            </h2>
            <Card className="divide-y divide-line-2">
              {game.waitlist.map((r, i) => (
                <PersonRow
                  key={r.id}
                  name={r.user.name}
                  color={r.user.avatarColor}
                  you={r.userId === user.id}
                  pos={i + 1}
                />
              ))}
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

function PersonRow({
  name,
  color,
  you,
  pos,
  attendanceStatus,
}: {
  name: string;
  color: string;
  you?: boolean;
  pos?: number;
  attendanceStatus?: "PRESENT" | "NO_SHOW" | null;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5">
      {pos && (
        <span className="w-5 text-center text-sm font-semibold text-ink-3">
          {pos}
        </span>
      )}
      <Avatar name={name} color={color} size={36} />
      <span className="flex-1 font-medium text-ink">{name}</span>
      {attendanceStatus === "PRESENT" && <Badge tone="ok">Present</Badge>}
      {attendanceStatus === "NO_SHOW" && <Badge tone="bad">No-show</Badge>}
      {you && <Badge tone="brand">You</Badge>}
    </div>
  );
}
