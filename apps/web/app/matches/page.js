"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Logo from "../../components/Logo";

const STATUS_LABELS = {
  SCHEDULED: "Upcoming",
  TIMED: "Upcoming",
  IN_PLAY: "Live",
  PAUSED: "Half-time",
  FINISHED: "Full-time",
  POSTPONED: "Postponed",
  CANCELLED: "Cancelled",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
  .getCompetitionMatches("PL")
  .then((data) => setMatches(data.matches))
  .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen">
            <header className="px-8 py-6">
        <Logo />
      </header>

      <div className="px-8 pb-16 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl tracking-wide uppercase mb-1">Premier League</h1>
        <p className="text-sm text-pitch-400 mb-8">Fixtures and results.</p>

        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
            <p className="text-xs text-pitch-400 mt-1">
              Double check FOOTBALL_DATA_API_KEY is set in apps/api/.env and the API server was
              restarted after adding it.
            </p>
          </div>
        )}

        {!matches && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {matches && matches.length === 0 && (
          <div className="surface p-6 text-center">
            <p className="text-sm text-pitch-400">No fixtures found for this competition right now.</p>
          </div>
        )}

        <ul className="space-y-2">
          {matches?.map((match) => (
            <li key={match.id}>
              <a
                href={`/matches/${match.id}`}
                className="surface p-4 flex items-center justify-between hover:border-pitch-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm">
                    {match.homeTeam.shortName || match.homeTeam.name}
                    <span className="text-pitch-400 mx-2">vs</span>
                    {match.awayTeam.shortName || match.awayTeam.name}
                  </p>
                  <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mt-1">
                    {STATUS_LABELS[match.status] || match.status}
                    {" · "}
                    {new Date(match.utcDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="font-mono text-lg text-chalk">
                  {match.score.fullTime.home ?? "–"} : {match.score.fullTime.away ?? "–"}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}