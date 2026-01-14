import { useCallback, useRef } from 'react';

/**
 * A hook that prevents a function from being called multiple times in rapid succession.
 * This is a "Leading Debounce" or "Exhaust" pattern:
 * - Executes immediately on the first call.
 * - Ignores all subsequent calls for the specified delay.
 * 
 * @param callback The function to wrap
 * @param delay The cooldown period in milliseconds (default: 1000ms)
 * @returns A wrapped function that can be safely used in onPress handlers
 */
export function usePreventDoubleTap(callback: (...args: any[]) => void, delay = 1000) {
  const isValidFunction = useRef(true);
  const timeoutRef = useRef<any>(null);

  const wrappedCallback = useCallback((...args: any[]) => {
    if (!isValidFunction.current) {
      return;
    }

    isValidFunction.current = false;
    
    // Execute immediately
    callback(...args);

    // Reset after delay
    timeoutRef.current = setTimeout(() => {
      isValidFunction.current = true;
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]);

  return wrappedCallback;
}
