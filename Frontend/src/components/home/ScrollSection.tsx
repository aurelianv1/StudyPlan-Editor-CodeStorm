"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/** Full-height section of the home page that fades in when scrolled into view. */
export function ScrollSection({ id, children, className = "" }: ScrollSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-screen flex flex-col justify-center relative overflow-hidden transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}
