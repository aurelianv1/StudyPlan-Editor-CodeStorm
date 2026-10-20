"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "../icons";

export const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "AI Editing", id: "ai-editing" },
  { label: "Doc Editing", id: "doc-editing" },
  { label: "Support", id: "support" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

/** Urmărește ce secțiune a paginii este vizibilă în viewport. */
function useActiveSection(initial: SectionId) {
  const [active, setActive] = useState<SectionId>(initial);

  useEffect(() => {
    const observers = NAV_ITEMS.map(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.5 }
      );
      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return active;
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection("home");

  const scrollTo = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <button onClick={() => scrollTo("home")} className="flex items-center gap-2.5 group">
        <Logo />
        <span className="text-white text-sm font-semibold tracking-tight">
          StudyPlan <span className="text-white/30 font-normal">Editor</span>
        </span>
      </button>

      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all duration-200 ${
              active === item.id ? "text-white bg-white/10" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="md:hidden text-white/60 hover:text-white transition-colors p-1"
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <CloseIcon className="w-5 h-5" strokeWidth={1.5} /> : <MenuIcon className="w-5 h-5" />}
      </button>

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0a0a0a] border-b border-white/10 py-3 px-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left px-3 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="w-5 h-5 grid grid-cols-2 gap-0.5">
      <span className="bg-white rounded-[1px]" />
      <span className="bg-white/40 rounded-[1px]" />
      <span className="bg-white/40 rounded-[1px]" />
      <span className="bg-white rounded-[1px]" />
    </span>
  );
}
