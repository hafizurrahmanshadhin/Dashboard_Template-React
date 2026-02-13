import { useEffect } from "react";

export function useBodyClass(className, enabled = true) {
  useEffect(() => {
    if (!className) return;
    const body = document.body;
    if (enabled) body.classList.add(className);
    return () => body.classList.remove(className);
  }, [className, enabled]);
}
