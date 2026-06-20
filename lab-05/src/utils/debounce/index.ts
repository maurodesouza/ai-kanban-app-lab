/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A new debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
