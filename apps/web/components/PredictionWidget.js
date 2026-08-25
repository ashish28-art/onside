"use client";

import { useEffect, useState } from "react";
import { api, ensureAccessToken } from "../lib/api";

export default function PredictionWidget({ matchId, matchStatus }) {
  const [authStatus, setAuthStatus] = useState("checking");
  const [existing, setExisting] = useState(null);
  const [winner, setWinner] = useState("HOME");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const canPredict = matchStatus === "SCHEDULED" || matchStatus === "TIMED";

    useEffect(() => {
    async function load() {
      try {
        await ensureAccessToken();
        setAuthStatus("loggedIn");
        const { prediction } = await api.getPredictionForMatch(matchId);
        setExisting(prediction);
      } catch {
        setAuthStatus("loggedOut");
      }
    }
    load();
  }, [matchId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.submitPrediction(Number(matchId), winner, Number(homeScore), Number(awayScore));
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (authStatus === "checking") return null;

  if (authStatus === "loggedOut") {
    return (
      <div className="surface p-4">
        <p className="text-sm text-pitch-400">
          <a href="/login" className="text-turf-light">Log in</a> to predict this match.
        </p>
      </div>
    );
  }

  if (!canPredict && !existing) {
    return (
      <div className="surface p-4">
        <p className="text-sm text-pitch-400">
          Predictions closed -- this match has already started.
        </p>
      </div>
    );
  }

  if (existing || submitted) {
    const p = existing || { predictedWinner: winner, predictedHomeScore: homeScore, predictedAwayScore: awayScore, pointsAwarded: null };
    return (
      <div className="surface p-4">
        <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-2">
          Your prediction
        </p>
        <p className="text-sm">
          {p.predictedHomeScore} - {p.predictedAwayScore} ({p.predictedWinner.toLowerCase()} win)
        </p>
        {p.pointsAwarded != null && (
          <p className="font-mono text-xs text-turf-light mt-2">+{p.pointsAwarded} points</p>
        )}
        {p.pointsAwarded == null && (
          <p className="text-xs text-pitch-400 mt-2">Points awarded once the match finishes.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface p-4 space-y-3">
      <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest">
        Predict the result
      </p>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          className="w-16 rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-2 py-2 text-sm text-center outline-none transition-colors"
          required
        />
        <span className="text-pitch-400">-</span>
        <input
          type="number"
          min="0"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          className="w-16 rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-2 py-2 text-sm text-center outline-none transition-colors"
          required
        />

        <select
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="ml-auto rounded-lg bg-pitch-950 border border-pitch-800 px-2 py-2 text-sm outline-none"
        >
          <option value="HOME">Home win</option>
          <option value="DRAW">Draw</option>
          <option value="AWAY">Away win</option>
        </select>
      </div>

      {error && <p className="text-xs text-offside">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-turf hover:bg-turf-light transition-colors py-2 text-sm font-medium text-pitch-950"
      >
        Submit prediction
      </button>
    </form>
  );
}