import { Divider } from "./Divider";

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Divider />
      <footer
        className={`text-center text-white/15 tracking-wider ${
          compact ? "py-6 text-[10px]" : "py-8 text-xs"
        }`}
      >
        StudyPlan Editor · Built for universities
      </footer>
    </>
  );
}
