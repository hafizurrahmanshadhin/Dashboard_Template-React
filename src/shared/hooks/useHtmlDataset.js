import { useEffect } from "react";

export function useHtmlDataset(dataset) {
  useEffect(() => {
    const html = document.documentElement;
    const prev = {};

    Object.entries(dataset || {}).forEach(([k, v]) => {
      prev[k] = html.dataset[k];
      if (v === null || typeof v === "undefined") {
        delete html.dataset[k];
      } else {
        html.dataset[k] = String(v);
      }
    });

    return () => {
      // restore previous values
      Object.entries(prev).forEach(([k, v]) => {
        if (typeof v === "undefined") delete html.dataset[k];
        else html.dataset[k] = v;
      });
    };
  }, [dataset]);
}
