import { Bell, Clock, Megaphone, Receipt, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  { icon: Megaphone, label: "Organizer announcements" },
  { icon: Clock, label: "Game reminders" },
  { icon: Zap, label: "Waitlist and spot offers" },
  { icon: Receipt, label: "Payment reminders" },
];

export function NotificationPreferences() {
  return (
    <Card className="divide-y divide-line-2">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3 p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
            <Icon className="size-4.5" />
          </span>
          <span className="flex-1 font-medium text-ink">{label}</span>
          <Badge tone="neutral">On</Badge>
        </div>
      ))}
      <div className="flex items-start gap-3 p-4">
        <Bell className="mt-0.5 size-5 text-brand-600" />
        <p className="text-sm leading-6 text-ink-2">
          Preference storage is coming with the notifications settings migration. For now,
          critical account and game updates remain enabled.
        </p>
      </div>
    </Card>
  );
}
