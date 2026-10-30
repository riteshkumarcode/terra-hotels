"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }
    const auth = sessionStorage.getItem("terraa_admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[var(--forest)] text-[var(--ivory)] flex items-center justify-center disp text-[24px]">
        Loading staff dashboard…
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem("terraa_admin_auth");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0E1411] text-[var(--ivory)] flex flex-col font-['Jost',sans-serif]">
      {/* Admin Top Navigation */}
      <header className="bg-[var(--forest2)] border-b border-[rgba(243,238,229,0.1)] px-8 py-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3 no-underline">
            <span className="w-9 h-9 rounded-full bg-[var(--ivory)] flex items-center justify-center">
              <Image src="/img/mark.png" alt="" width={32} height={32} />
            </span>
            <span className="font-['Marcellus',serif] text-[16px] tracking-[0.16em] uppercase text-[var(--ivory)]">
              Terraa Admin
            </span>
          </Link>
          <span className="px-2.5 py-1 bg-[rgba(184,149,90,0.15)] text-[var(--gold)] cap text-[10px] rounded">
            Staff Portal
          </span>
        </div>

        <div className="flex items-center gap-6 text-[13px]">
          <Link
            href="/"
            target="_blank"
            className="text-[var(--dmuted)] hover:text-[var(--ivory)] transition-colors"
          >
            ↗ Public Website
          </Link>
          <a
            href="/api/admin/bookings/export"
            download
            className="btn btn-ghost !min-h-[38px] !px-4 !text-[10px]"
          >
            Export Bookings (CSV)
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="cap text-[11px] text-[#F2C6B4] hover:text-[var(--ivory)] cursor-pointer bg-transparent border-0"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 max-[900px]:p-4 max-w-[1440px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
