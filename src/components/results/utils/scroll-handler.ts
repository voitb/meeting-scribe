/**
 * Checks if element requires scroll buttons
 * @param element Element to check
 * @returns true if element requires scroll buttons
 */
export function checkOverflow(element: HTMLElement | null): boolean {
  if (!element) return false;
  const { scrollWidth, clientWidth } = element;
  return scrollWidth > clientWidth;
}

/**
 * Scrolls element left or right
 * @param element Element to scroll
 * @param direction Scroll direction ('left' or 'right')
 */
export function scrollElement(
  element: HTMLElement | null,
  direction: "left" | "right"
): void {
  if (!element) return;
  const scrollAmount = direction === "left" ? -150 : 150;
  element.scrollBy({ left: scrollAmount, behavior: "smooth" });
} 