"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyInvite({
  code,
  handle,
}: {
  code: string;
  handle: string;
}) {
  const [copied, setCopied] = useState(false);
  const inviteText = useMemo(() => {
    if (typeof window === "undefined") return code;
    return `${window.location.origin}/clubs/${handle}\nJoin code: ${code}`;
  }, [code, handle]);

  async function copy() {
    await navigator.clipboard.writeText(inviteText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={copy}
      className="border border-white/10 bg-white/8 text-white ring-0 hover:bg-white/14"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy invite"}
    </Button>
  );
}
