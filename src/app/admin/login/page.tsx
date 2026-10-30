"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@terraahotels.com");
  const [password, setPassword] = useState("terraa2026admin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simple staff validation
    if (
      email === "admin@terraahotels.com" &&
      (password === "terraa2026admin" || password === "admin123")
    ) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("terraa_admin_auth", "true");
      }
      router.push("/admin");
    } else {
      setError("Invalid staff credentials. Use admin@terraahotels.com / terraa2026admin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--forest)] text-[var(--ivory)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] flex flex-col gap-8 bg-[var(--forest2)] p-10 border border-[rgba(243,238,229,0.14)] shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-16 h-16 rounded-full bg-[var(--ivory)] flex items-center justify-center mb-2">
            <Image
              src="/img/mark.png"
              alt="Terraa Hotels"
              width={56}
              height={56}
              className="w-14 h-14"
            />
          </span>
          <span className="cap text-[11px] text-[var(--gold)]">
            Staff Portal
          </span>
          <h1 className="disp text-[34px] font-light leading-none m-0">
            Terraa Concierge
          </h1>
          <p className="text-[13px] font-light text-[var(--dmuted)] m-0">
            Sign in to manage hotels, daily inventory, and guest reservations.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
          {error && (
            <div className="p-3 text-[13px] bg-[#9A3B2A]/20 border border-[#9A3B2A] text-[#F2C6B4]">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="cap text-[11px] text-[var(--dmuted2)]">
              Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="fld h-[48px] border-0 border-b border-[rgba(243,238,229,0.3)] bg-transparent text-[var(--ivory)] disp text-[20px] outline-none focus:border-b-[var(--gold)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="cap text-[11px] text-[var(--dmuted2)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="fld h-[48px] border-0 border-b border-[rgba(243,238,229,0.3)] bg-transparent text-[var(--ivory)] disp text-[20px] outline-none focus:border-b-[var(--gold)]"
            />
          </label>

          <div className="p-3 bg-[rgba(184,149,90,0.1)] border border-[rgba(184,149,90,0.25)] text-[12px] text-[var(--gold)]">
            Default credentials: <strong>admin@terraahotels.com</strong> / <strong>terraa2026admin</strong>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-brass w-full mt-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <Link
          href="/"
          className="cap lnk self-center text-[11px] text-[var(--dmuted2)] hover:text-[var(--ivory)]"
        >
          ← Return to Public Site
        </Link>
      </div>
    </div>
  );
}
