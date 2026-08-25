"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ensureAccessToken } from "../../lib/api";
import Logo from "../../components/Logo";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
                await ensureAccessToken();
        const { user } = await api.me();
        setUser(user);
      } catch {
        router.push("/login");
      }
    }
    loadProfile();
  }, [router]);

  async function handleLogout() {
    await api.logout();
    ensureAccessToken(null);
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo />
        <button
          onClick={handleLogout}
          className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-4 py-2 text-sm font-medium"
        >
          Log out
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center px-8 pt-12">
        <div className="max-w-sm w-full space-y-6">
          <div className="flex items-center gap-4">
            <div className="center-spot text-turf w-14 h-14" aria-hidden="true" />
            <div>
              <h1 className="font-display text-3xl tracking-wide uppercase leading-none">
                {user.username}
              </h1>
              <p className="text-sm text-pitch-400 mt-1">{user.email}</p>
            </div>
          </div>

                    <div className="surface p-4">
            <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
              Member since
            </p>
            <p className="font-mono text-2xl text-chalk">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={`/u/${user.username}`}
              className="flex-1 text-center rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-4 py-2 text-sm font-medium"
            >
              Public profile
            </a>
            <a
              href="/dashboard"
              className="flex-1 text-center rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-4 py-2 text-sm font-medium"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
