/**
 * Scroll helpers used for shareable deep links.
 * Offsets account for the sticky navbar.
 */

export const SCROLL_OFFSET = 88;

export function scrollToSectionId(
  id: string,
  opts?: { behavior?: ScrollBehavior; offset?: number }
): boolean {
  if (typeof document === "undefined") return false;
  const target = document.getElementById(id);
  if (!target) return false;
  const offset = opts?.offset ?? SCROLL_OFFSET;
  const top =
    target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - offset;
  window.scrollTo({ top, behavior: opts?.behavior ?? "smooth" });
  return true;
}

/**
 * Keeps retrying until the target element is present (sections are lazy
 * loaded, so the element may not exist on the first attempt).
 */
export function scrollToSectionIdWithRetry(
  id: string,
  opts?: { attempts?: number; intervalMs?: number; behavior?: ScrollBehavior }
): () => void {
  const attempts = opts?.attempts ?? 30;
  const intervalMs = opts?.intervalMs ?? 100;
  const behavior = opts?.behavior ?? "smooth";
  let remaining = attempts;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = () => {
    if (scrollToSectionId(id, { behavior })) return;
    remaining -= 1;
    if (remaining <= 0) return;
    timer = setTimeout(tick, intervalMs);
  };

  timer = setTimeout(tick, 150);
  return () => {
    if (timer) clearTimeout(timer);
  };
}