"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ensureAccessToken } from "../../lib/api";
import Logo from "../../components/Logo";

export default function DashboardPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
                await ensureAccessToken();
        const { favorites } = await api.getFavoriteTeams();
        setFavorites(favorites);
      } catch {
        router.push("/login");
      }
    }
    load();
  }, [router]);

  async function unfollow(teamId) {
    await api.removeFavoriteTeam(teamId);
    setFavorites((prev) => prev.filter((f) => f.teamId !== teamId));
  }

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6 flex items-center justify-between">
        <Logo />
        <a href="/matches" className="text-sm text-pitch-400 hover:text-chalk transition-colors">
          Matches
        </a>
      </header>

      <div className="px-8 pb-16 max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide uppercase leading-none">
            Your teams
          </h1>
          <p className="text-sm text-pitch-400 mt-1">Clubs you follow.</p>
        </div>

        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!favorites && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {favorites && favorites.length === 0 && (
          <div className="surface p-6 text-center space-y-3">
            <p className="text-sm text-pitch-400">You're not following any teams yet.</p>
            <a
              href="/matches"
              className="inline-block rounded-lg bg-turf hover:bg-turf-light transition-colors px-4 py-2 text-sm font-medium text-pitch-950"
            >
              Browse matches to find one
            </a>
          </div>
        )}

        <ul className="space-y-2">
          {favorites?.map((fav) => (
            <li key={fav.teamId} className="surface p-4 flex items-center justify-between">
              <a href={`/teams/${fav.teamId}`} className="text-sm hover:text-turf-light transition-colors">
                {fav.teamName}
              </a>
              <button
                onClick={() => unfollow(fav.teamId)}
                className="text-xs text-pitch-400 hover:text-offside transition-colors"
              >
                Unfollow
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}