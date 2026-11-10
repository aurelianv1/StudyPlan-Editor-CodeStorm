import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/layout/icons";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  size?: "md" | "lg";
  className?: string;
}

/** White call-to-action link with an arrow that nudges right on hover. */
export function ArrowLink({ href, children, size = "md", className = "" }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex w-fit items-center gap-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 active:scale-95 ${
        size === "lg" ? "px-6 py-3" : "px-5 py-2.5"
      } ${className}`}
    >
      {children}
      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
