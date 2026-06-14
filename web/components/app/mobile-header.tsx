import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";

export function MobileHeader({
  user,
}: {
  user: { name: string; avatarColor: string };
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Link href="/home">
        <Logo size={28} />
      </Link>
      <Link href="/profile">
        <Avatar name={user.name} color={user.avatarColor} size={32} />
      </Link>
    </header>
  );
}
