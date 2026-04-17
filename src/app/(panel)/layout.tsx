import type { ReactNode } from "react";
import { Shell } from "@/components/layout/Shell";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
