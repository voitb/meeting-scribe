export function checkOverflow(element: HTMLElement | null): boolean {
  if (!element) return false;
  const { scrollWidth, clientWidth } = element;
  return scrollWidth > clientWidth;
}

export function scrollElement(
  element: HTMLElement | null,
  direction: "left" | "right"
): void {
  if (!element) return;
  const scrollAmount = direction === "left" ? -150 : 150;
  element.scrollBy({ left: scrollAmount, behavior: "smooth" });
} 