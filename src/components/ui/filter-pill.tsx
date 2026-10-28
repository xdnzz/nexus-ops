export function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 shrink-0 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap ${
        active ? 'bg-fg text-canvas' : 'bg-subtle text-fg-muted'
      }`}
    >
      {label}
    </button>
  );
}
