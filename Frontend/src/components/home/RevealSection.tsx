import type { ReactNode } from "react";

/** Secțiune de înălțime completă care apare cu o animație de fade-in la încărcare. */
export function RevealSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`min-h-screen flex flex-col justify-center relative overflow-hidden animate-fade-up ${className}`}
    >
      {children}
    </section>
  );
}
