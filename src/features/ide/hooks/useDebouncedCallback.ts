import { useCallback, useRef } from 'react';

/**
 * Returns a debounced version of the provided callback.
 * Uses useRef internally to avoid re-renders from timeout tracking.
 *
 * Fixes the useState-based implementation which caused:
 * 1. Unnecessary re-renders on every debounced call
 * 2. Stale closures due to timeoutId in useCallback deps
 */
export function useDebouncedCallback<A extends unknown[], R>(
  callback: (...args: A) => R,
  delay: number,
): (...args: A) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
