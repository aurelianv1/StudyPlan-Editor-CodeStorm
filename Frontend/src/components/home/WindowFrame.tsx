import type { ReactNode } from "react";

interface WindowFrameProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Mock application window used by the feature previews. */
export function WindowFrame({ title, children, className = "" }: WindowFrameProps) {
  return (
    <div
      className={`hidden md:flex flex-col rounded-xl border border-white/8 bg-white/[.03] overflow-hidden text-xs ${className}`}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8">
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="ml-2 text-white/20">{title}</span>
      </div>
      {children}
    </div>
  );
}
