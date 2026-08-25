"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getAccessToken, ensureAccessToken } from "../../../lib/api";
import Logo from "../../../components/Logo";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  useEffect(() => {
    api
      .getPublicProfile(params.username)
      .then((data) => setProfile(data.user))
      .catch((err) => setError(err.message));
  }, [params.username]);

  useEffect(() => {
    async function checkFollow() {
      try {
                await ensureAccessToken();
        const { following } = await api.isFollowingUser(params.username);
        setIsFollowing(following);
      } catch {
        setIsFollowing(false);
      } finally {
        setCheckingFollow(false);
      }
    }
    checkFollow();
  }, [params.username]);

  async function toggleFollow() {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    try {
      if (isFollowing) {
        await api.unfollowUser(params.username);
        setIsFollowing(false);
      } else {
        await api.followUser(params.username);
        setIsFollowing(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6">
        <Logo />
      </header>

      <div className="px-8 pb-16 max-w-sm mx-auto">
        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!profile && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {profile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="center-spot text-turf w-12 h-12" aria-hidden="true" />
                <div>
                  <h1 className="font-display text-2xl tracking-wide uppercase leading-none">
                    {profile.username}
                  </h1>
                  <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mt-1">
                    {profile._count.followers} followers · {profile._count.following} following
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={toggleFollow}
              disabled={checkingFollow}
              className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                isFollowing
                  ? "border border-pitch-800 hover:border-pitch-600"
                  : "bg-turf hover:bg-turf-light text-pitch-950"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <div className="surface p-4">
              <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
                Following
              </p>
              {profile.favoriteTeams.length === 0 && (
                <p className="text-sm text-pitch-400">No teams followed yet.</p>
              )}
              <ul className="space-y-1">
                {profile.favoriteTeams.map((team) => (
                  <li key={team.teamId}>
                    <a
                      href={`/teams/${team.teamId}`}
                      className="text-sm hover:text-turf-light transition-colors"
                    >
                      {team.teamName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}