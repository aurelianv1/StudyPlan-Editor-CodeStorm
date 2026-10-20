import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./icons";

/** Fundal cu grilă fină, folosit pe majoritatea paginilor. */
export function GridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />
  );
}

export function Divider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}

export function PageFooter() {
  return (
    <>
      <Divider />
      <footer className="py-6 text-center text-[10px] text-white/15 tracking-wider">
        StudyPlan Editor · Built for universities
      </footer>
    </>
  );
}

export function Spinner({ className = "w-10 h-10" }: { className?: string }) {
  return <div className={`${className} border-2 border-white/10 border-t-white rounded-full animate-spin`} />;
}

/** Etichetă mică deasupra titlurilor de secțiune (ex. „01 — AI Editing”). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-xs tracking-[0.25em] uppercase text-white/25">{children}</span>;
}

const PRIMARY_LINK_SIZES = {
  md: "px-5 py-2.5",
  lg: "px-6 py-3",
};

/** Link afișat ca buton principal (alb), cu săgeată animată la hover. */
export function PrimaryLink({
  href,
  children,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  size?: keyof typeof PRIMARY_LINK_SIZES;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex w-fit items-center gap-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 active:scale-95 ${PRIMARY_LINK_SIZES[size]} ${className}`}
    >
      {children}
      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
