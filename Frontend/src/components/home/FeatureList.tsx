export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-white/35">
          <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border border-white/15 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
