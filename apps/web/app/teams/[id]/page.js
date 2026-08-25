"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getAccessToken, ensureAccessToken } from "../../../lib/api";
import Logo from "../../../components/Logo";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  useEffect(() => {
    api.getTeam(params.id).then(setTeam).catch((err) => setError(err.message));
  }, [params.id]);

  useEffect(() => {
    async function checkFavorite() {
      try {
                await ensureAccessToken();
        const { favorites } = await api.getFavoriteTeams();
        setIsFavorite(favorites.some((f) => f.teamId === Number(params.id)));
      } catch {
        setIsFavorite(false);
      } finally {
        setCheckingFavorite(false);
      }
    }
    checkFavorite();
  }, [params.id]);

  async function toggleFavorite() {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    try {
      if (isFavorite) {
        await api.removeFavoriteTeam(team.id);
        setIsFavorite(false);
      } else {
        await api.addFavoriteTeam(team.id, team.shortName || team.name, team.crest);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6 flex items-center justify-between">
        <Logo />
        <a href="/matches" className="text-sm text-pitch-400 hover:text-chalk transition-colors">
          Matches
        </a>
      </header>

      <div className="px-8 pb-16 max-w-xl mx-auto">
        {error && (
          <div className="surface p-4 mb-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!team && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {team && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl tracking-wide uppercase leading-none">
                  {team.name}
                </h1>
                <p className="text-sm text-pitch-400 mt-1">{team.area?.name}</p>
              </div>
              <button
                onClick={toggleFavorite}
                disabled={checkingFavorite}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isFavorite
                    ? "border border-pitch-800 hover:border-pitch-600"
                    : "bg-turf hover:bg-turf-light text-pitch-950"
                }`}
              >
                {isFavorite ? "Following" : "Follow"}
              </button>
            </div>

            <div className="surface p-4">
              <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
                Club info
              </p>
              <dl className="text-sm space-y-2">
                {team.venue && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Venue</dt>
                    <dd>{team.venue}</dd>
                  </div>
                )}
                {team.founded && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Founded</dt>
                    <dd>{team.founded}</dd>
                  </div>
                )}
                {team.clubColors && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Colors</dt>
                    <dd>{team.clubColors}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}