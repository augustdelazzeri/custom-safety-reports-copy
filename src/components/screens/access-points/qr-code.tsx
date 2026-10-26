/**
 * The QR placeholder of the redesign (safety-redesign src/lab/ui/lab-placeholder.tsx → LabQrCode):
 * a fixed pattern, not an encoder. It reads as a QR code at a glance, the middle says it is not
 * real, and the same access point always draws the same pattern. The redesign's
 * `--lab-qr-ink/paper` become `text-foreground` on `bg-card` here.
 */

import { cn } from "@/lib/utils";

const CELLS = 21;
const FINDER_ORIGINS = [
  [0, 0],
  [CELLS - 7, 0],
  [0, CELLS - 7],
] as const;

const isFinder = (x: number, y: number) =>
  FINDER_ORIGINS.some(([ox, oy]) => {
    const dx = x - ox;
    const dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
    return Math.max(Math.abs(dx - 3), Math.abs(dy - 3)) !== 2;
  });

const isFinderZone = (x: number, y: number) => FINDER_ORIGINS.some(([ox, oy]) => x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7);

const isOn = (x: number, y: number, seed: number) => (x * 7 + y * 13 + seed * 31) % 5 < 2;

/** A number from the id, so each code keeps its own pattern. */
export const qrSeed = (id: string) => [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 97;

export function QrPlaceholder({ seed, size = 176, className }: { seed: number; size?: number; className?: string }) {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < CELLS; y += 1) {
    for (let x = 0; x < CELLS; x += 1) {
      // The middle is cleared so the label sits on paper, like a logo cut-out.
      if (x >= 3 && x <= 17 && y >= 9 && y <= 12) continue;
      if (isFinder(x, y) || (!isFinderZone(x, y) && isOn(x, y, seed))) cells.push({ x, y });
    }
  }
  return (
    <div role="img" aria-label="QR code, placeholder pattern" className={cn("relative rounded-lg border border-border bg-card p-4 text-foreground", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${CELLS} ${CELLS}`} className="size-full" fill="currentColor" aria-hidden>
        {cells.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" rx="0.2" />
        ))}
      </svg>
      <span className="absolute inset-x-3 top-1/2 -translate-y-1/2 bg-card py-0.5 text-center text-xs font-semibold tracking-widest text-foreground uppercase">Coming soon</span>
    </div>
  );
}
