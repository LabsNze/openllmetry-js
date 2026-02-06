"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-foreground text-lg">
              OpenLLMetry
            </Link>
            <div className="flex gap-1">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Traces
              </Link>
              <Link
                href="/metrics"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/metrics")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Metrics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
