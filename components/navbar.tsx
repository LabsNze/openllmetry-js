"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path) && path !== '/';
  const isHome = pathname === '/home' || pathname === '/';

  return (
    <nav className="navbar px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">E</span>
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:inline">ErrorWatch</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {!isHome && (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/analytics"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/analytics")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/alert-rules"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/alert-rules")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface"
                }`}
              >
                Alerts
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
