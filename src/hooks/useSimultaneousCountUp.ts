import { useLayoutEffect, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates three integers from 0 to their targets over the same duration (requestAnimationFrame).
 */
export function useSimultaneousCountUp(
  a: number,
  b: number,
  c: number,
  durationMs = 1200,
): [number, number, number] {
  const [display, setDisplay] = useState<[number, number, number]>([0, 0, 0]);

  useLayoutEffect(() => {
    const targets: [number, number, number] = [a, b, c];
    if (targets.every((n) => n === 0)) {
      setDisplay([0, 0, 0]);
      return;
    }

    setDisplay([0, 0, 0]);
    let start: number | null = null;
    let raf = 0;

    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      setDisplay([
        Math.round(eased * targets[0]),
        Math.round(eased * targets[1]),
        Math.round(eased * targets[2]),
      ]);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplay([...targets]);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [a, b, c, durationMs]);

  return display;
}
