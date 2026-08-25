"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getAccessToken } from "../../../lib/api";
import Logo from "../../../components/Logo";
import RoomChat from "../../../components/RoomChat";
import PredictionWidget from "../../../components/PredictionWidget";

const STATUS_LABELS = {
  SCHEDULED: "Upcoming",
  TIMED: "Upcoming",
  IN_PLAY: "Live",
  PAUSED: "Half-time",
  FINISHED: "Full-time",
  POSTPONED: "Postponed",
  CANCELLED: "Cancelled",
};

function WatchTogether({ matchId }) {
  const router = useRouter();
  const [parties, setParties] = useState(null);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    api.getWatchPartiesForMatch(matchId).then((data) => setParties(data.parties));
  }, [matchId]);

  async function createRoom(e) {
    e.preventDefault();
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    const { watchParty } = await api.createWatchParty(Number(matchId), roomName || "Watch party");
    router.push(`/watch-party/${watchParty.id}`);
  }

  return (
    <div className="surface p-4">
      <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
        Watch together
      </p>

      {parties?.length === 0 && (
        <p className="text-sm text-pitch-400 mb-3">No public rooms yet for this match.</p>
      )}

      <ul className="space-y-2 mb-3">
        {parties?.map((p) => (
          <li key={p.id}>
            <a
              href={`/watch-party/${p.id}`}
              className="flex items-center justify-between rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-3 py-2 text-sm"
            >
              <span>{p.name}</span>
              <span className="font-mono text-xs text-pitch-400">{p._count.members} watching</span>
            </a>
          </li>
        ))}
      </ul>

      {creating ? (
        <form onSubmit={createRoom} className="flex gap-2">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            className="flex-1 rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-3 py-2 text-sm outline-none transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-turf hover:bg-turf-light transition-colors px-4 py-2 text-sm font-medium text-pitch-950"
          >
            Create
          </button>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-4 py-2 text-sm font-medium"
        >
          Create a room
        </button>
      )}
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMatch(params.id)
      .then(setMatch)
      .catch((err) => setError(err.message));
  }, [params.id]);

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6 flex items-center justify-between">
        <Logo />
        <a href="/matches" className="text-sm text-pitch-400 hover:text-chalk transition-colors">
          All matches
        </a>
      </header>

      <div className="px-8 pb-16 max-w-xl mx-auto">
        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!match && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {match && (
          <div className="space-y-6">
            <div>
              <p className="font-mono text-xs text-turf uppercase tracking-widest mb-2">
                {match.competition?.name}
              </p>
              <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest">
                {STATUS_LABELS[match.status] || match.status}
                {" · "}
                {new Date(match.utcDate).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="surface p-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-center space-y-2">
                  <a
                    href={`/teams/${match.homeTeam?.id}`}
                    className="font-display text-lg tracking-wide uppercase leading-tight hover:text-turf-light transition-colors block"
                  >
                    {match.homeTeam?.shortName || match.homeTeam?.name}
                  </a>
                </div>

                <div className="text-center">
                  <p className="font-mono text-4xl text-chalk">
                    {match.score?.fullTime?.home ?? "–"} : {match.score?.fullTime?.away ?? "–"}
                  </p>
                  {match.score?.halfTime?.home != null && (
                    <p className="font-mono text-xs text-pitch-400 mt-1">
                      HT {match.score.halfTime.home} : {match.score.halfTime.away}
                    </p>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <a
                    href={`/teams/${match.awayTeam?.id}`}
                    className="font-display text-lg tracking-wide uppercase leading-tight hover:text-turf-light transition-colors block"
                  >
                    {match.awayTeam?.shortName || match.awayTeam?.name}
                  </a>
                </div>
              </div>
            </div>

            <div className="surface p-4">
              <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
                Match info
              </p>
              <dl className="text-sm space-y-2">
                {match.venue && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Venue</dt>
                    <dd>{match.venue}</dd>
                  </div>
                )}
                {match.matchday && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Matchday</dt>
                    <dd>{match.matchday}</dd>
                  </div>
                )}
                {match.referees?.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-pitch-400">Referee</dt>
                    <dd>{match.referees[0].name}</dd>
                  </div>
                )}
              </dl>
              <p className="text-xs text-pitch-400 mt-4">
                Lineups and detailed match stats need a paid football-data.org tier -- not
                available here yet.
              </p>
            </div>

                        <PredictionWidget matchId={params.id} matchStatus={match.status} />

            <WatchTogether matchId={params.id} />

            <RoomChat roomId={`match:${params.id}`} />
          </div>
        )}
      </div>
    </main>
  );
}