"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Logo from "../../components/Logo";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getGlobalLeaderboard()
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6">
        <Logo />
      </header>

      <div className="px-8 pb-16 max-w-md mx-auto">
        <h1 className="font-display text-3xl tracking-wide uppercase leading-none mb-1">
          Leaderboard
        </h1>
        <p className="text-sm text-pitch-400 mb-8">Top predictors, all-time.</p>

        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!leaderboard && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {leaderboard?.length === 0 && (
          <div className="surface p-6 text-center">
            <p className="text-sm text-pitch-400">
              No scored predictions yet -- check back once some matches finish.
            </p>
          </div>
        )}

        <ol className="space-y-2">
          {leaderboard?.map((entry, i) => (
            <li key={entry.username} className="surface p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-pitch-400 w-6">{i + 1}</span>
                <span className="text-sm">{entry.username}</span>
              </div>
              <span className="font-mono text-sm text-turf-light">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}