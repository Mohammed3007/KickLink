"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#clubs", label: "For organizers" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-xl"
          : "border-b border-white/10 bg-field-950/35 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="KickLink home">
          <Logo size={32} light={!scrolled} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={cn(
                "text-sm font-medium transition-colors",
                scrolled ? "text-ink-2 hover:text-ink" : "text-white/72 hover:text-white"
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                !scrolled && "text-white hover:bg-white/10 active:bg-white/15"
              )}
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup" className="hidden sm:block">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
