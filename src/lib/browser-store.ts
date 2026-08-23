import { useCallback, useMemo, useSyncExternalStore } from "react";

function subscribeToKey(key: string) {
  return (onStoreChange: () => void) => {
    const handler = (event: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== key) return;
      onStoreChange();
    };
    window.addEventListener("storage", handler);
    window.addEventListener(key, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(key, handler);
    };
  };
}

function getServerSnapshot() {
  return null;
}

export function useBrowserStore<T>(key: string, fallback: T) {
  const subscribe = useMemo(() => subscribeToKey(key), [key]);
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [fallback, raw]);

  const setValue = useCallback(
    (next: T | null) => {
      if (next === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(key));
    },
    [key],
  );

  return [value, setValue] as const;
}
