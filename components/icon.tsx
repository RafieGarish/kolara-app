import { ICONS, type IconName } from "@/lib/icon-data";
import { cn } from "@/lib/utils";

/**
 * Renders one of the original Kolara stroke icons.
 * The wrapper keeps the original `data-icon` attribute so the legacy CSS selectors
 * (e.g. `.due [data-icon]`) keep working.
 */
export function Icon({
  name,
  size,
  className,
  style,
}: {
  name: IconName | (string & {});
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const def = ICONS[name];
  if (!def) return null;
  const s = size ?? def.size;
  return (
    <span data-icon={name} className={cn(className)} style={style} aria-hidden="true">
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill={def.fill ? "currentColor" : "none"}
        stroke={def.fill ? "none" : "currentColor"}
        strokeWidth={def.sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: def.inner }}
      />
    </span>
  );
}
