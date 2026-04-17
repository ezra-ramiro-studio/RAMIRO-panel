import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-full">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header />
        <main className="flex-1 min-w-0">
          <div className="max-w-[1280px] mx-auto px-8 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
