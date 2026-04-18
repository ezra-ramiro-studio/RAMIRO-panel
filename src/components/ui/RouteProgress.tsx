"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const firstRenderRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    setActive(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setActive(false), 650);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none overflow-hidden transition-opacity ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div className="h-full bg-burgundy route-progress-bar" />
      <style>{`
        @keyframes routeProgressSlide {
          0% { transform: translateX(-100%); }
          60% { transform: translateX(10%); }
          100% { transform: translateX(100%); }
        }
        .route-progress-bar {
          animation: routeProgressSlide 650ms cubic-bezier(0.2, 0, 0, 1);
        }
      `}</style>
    </div>
  );
}
