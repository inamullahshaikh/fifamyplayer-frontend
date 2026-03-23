import { useEffect, useRef } from "react";

/**
 * Adds `is-visible` to every child matching `itemSelector` when it scrolls
 * into the viewport. Stagger is handled purely in CSS via custom property
 * `--reveal-i` set on each element.
 */
export function useScrollReveal(itemSelector: string) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    items.forEach((el, i) => {
      el.style.setProperty("--reveal-i", String(i));
    });

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [itemSelector]);

  return ref;
}
