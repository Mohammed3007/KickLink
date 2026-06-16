import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MobileHeader({
  user,
  isOrganizer,
}: {
  user: { name: string; avatarColor: string };
  isOrganizer?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl lg:hidden",
        isOrganizer
          ? "border-gold-400/15 bg-field-950/92"
          : "border-gold-400/15 bg-[#fffdf6]/92"
      )}
    >
      <Link href="/home">
        <Logo size={28} light={isOrganizer} />
      </Link>
      <Link href="/profile">
        <Avatar name={user.name} color={user.avatarColor} size={32} />
      </Link>
    </header>
  );
}
