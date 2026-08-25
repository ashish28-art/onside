import { env } from "../../config/env.js";

async function fetchFromProvider(path) {
  const res = await fetch(`${env.footballDataBaseUrl}${path}`, {
    headers: { "X-Auth-Token": env.footballDataApiKey },
  });

  if (res.status === 429) {
    throw new Error("Football data provider rate limit exceeded. Try again shortly.");
  }

  if (!res.ok) {
    throw new Error(`Football data provider error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const footballProvider = {
  getCompetitions: () => fetchFromProvider("/competitions"),
  getCompetitionStandings: (code) => fetchFromProvider(`/competitions/${code}/standings`),
  getCompetitionMatches: (code) => fetchFromProvider(`/competitions/${code}/matches`),
  getTeam: (id) => fetchFromProvider(`/teams/${id}`),
  getMatches: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return fetchFromProvider(`/matches${query ? `?${query}` : ""}`);
  },
  getMatch: (id) => fetchFromProvider(`/matches/${id}`),
};