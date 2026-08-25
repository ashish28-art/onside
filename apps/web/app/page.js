"use client";

import { useEffect, useState } from "react";
import { api, ensureAccessToken } from "../lib/api";
import Logo from "../components/Logo";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
           async function checkAuth() {
      try {
        await ensureAccessToken();
        const { user } = await api.me();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-8 py-6">
        <Logo />
      </header>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-8">
          {checkingAuth && (
            <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">
              Loading...
            </p>
          )}

          {!checkingAuth && user && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xl text-turf  tracking-widest uppercase">
                  welcome back
                </p>
                <h1 className="font-display text-4xl tracking-wide uppercase leading-none mt-1">
                  {user.username}
                </h1>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="/matches"
                  className="rounded-lg bg-turf hover:bg-turf-light transition-colors px-5 py-3 text-sm font-medium text-pitch-950 text-center"
                >
                  View matches
                </a>
                <a
                  href="/dashboard"
                  className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-5 py-3 text-sm font-medium text-center"
                >
                  Your dashboard
                </a>
                <a
                  href="/profile"
                  className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-5 py-3 text-sm font-medium text-center"
                >
                  Your profile
                </a>
              </div>
            </div>
          )}

          {!checkingAuth && !user && (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="font-mono text-xs text-turf tracking-widest uppercase">
                  90 minutes. one community.
                </p>
                <h1 className="font-display text-5xl tracking-wide uppercase leading-none">
                  Follow every match.
                  <br />
                  Feel every goal.
                </h1>
              </div>

              <div className="flex gap-3">
                <a
                  href="/register"
                  className="rounded-lg bg-turf hover:bg-turf-light transition-colors px-5 py-2.5 text-sm font-medium text-pitch-950"
                >
                  Create account
                </a>
                <a
                  href="/login"
                  className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-5 py-2.5 text-sm font-medium"
                >
                  Log in
                </a>
                <a
                  href="/matches"
                  className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-5 py-2.5 text-sm font-medium"
                >
                  View matches
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}