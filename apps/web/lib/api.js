const API_BASE = "http://localhost:4000/api/v1";

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

let refreshPromise = null;

export async function ensureAccessToken() {
  if (accessToken) return accessToken;

  if (!refreshPromise) {
    refreshPromise = request("/auth/refresh", { method: "POST" })
      .then(({ accessToken: token }) => {
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email, username, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, username, password }) }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  refresh: () => request("/auth/refresh", { method: "POST" }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/users/me"),

  getCompetitionMatches: (code) => request(`/competitions/${code}/matches`),

  getMatch: (id) => request(`/matches/${id}`),

  getMatches: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/matches${query ? `?${query}` : ""}`);
  },

  getTeam: (id) => request(`/teams/${id}`),

  getFavoriteTeams: () => request("/favorites/teams"),

  addFavoriteTeam: (teamId, teamName, crestUrl) =>
    request("/favorites/teams", {
      method: "POST",
      body: JSON.stringify({ teamId, teamName, crestUrl }),
    }),

  removeFavoriteTeam: (teamId) =>
    request(`/favorites/teams/${teamId}`, { method: "DELETE" }),

  getPublicProfile: (username) => request(`/follows/u/${username}`),

  isFollowingUser: (username) => request(`/follows/${username}/is-following`),

  followUser: (username) => request(`/follows/${username}`, { method: "POST" }),

  unfollowUser: (username) => request(`/follows/${username}`, { method: "DELETE" }),

  getWatchPartiesForMatch: (matchId) => request(`/watch-parties/match/${matchId}`),

  createWatchParty: (matchId, name, isPrivate) =>
    request("/watch-parties", {
      method: "POST",
      body: JSON.stringify({ matchId, name, isPrivate }),
    }),

  getWatchParty: (id) => request(`/watch-parties/${id}`),

  joinWatchParty: (id, inviteCode) =>
    request(`/watch-parties/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    }),

    leaveWatchParty: (id) => request(`/watch-parties/${id}/leave`, { method: "POST" }),

  submitPrediction: (matchId, predictedWinner, predictedHomeScore, predictedAwayScore) =>
    request("/predictions", {
      method: "POST",
      body: JSON.stringify({ matchId, predictedWinner, predictedHomeScore, predictedAwayScore }),
    }),

  getMyPredictions: () => request("/predictions/me"),

  getPredictionForMatch: (matchId) => request(`/predictions/match/${matchId}`),

  getGlobalLeaderboard: () => request("/leaderboards/global"),
};