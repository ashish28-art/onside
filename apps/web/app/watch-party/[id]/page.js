"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ensureAccessToken } from "../../../lib/api";
import Logo from "../../../components/Logo";
import RoomChat from "../../../components/RoomChat";

export default function WatchPartyPage() {
  const params = useParams();
  const router = useRouter();
  const [party, setParty] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
                await ensureAccessToken();
        await api.joinWatchParty(params.id).catch(() => {});
        const { watchParty } = await api.getWatchParty(params.id);
        setParty(watchParty);
      } catch (err) {
        if (err.message.includes("private")) {
          setError("This room is private. You need a valid invite link to join.");
        } else {
          router.push("/login");
        }
      }
    }
    load();
  }, [params.id, router]);

  function copyInviteLink() {
    const url = `${window.location.origin}/watch-party/${params.id}?invite=${party.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen">
      <header className="px-8 py-6">
        <Logo />
      </header>

      <div className="px-8 pb-16 max-w-xl mx-auto">
        {error && (
          <div className="surface p-4">
            <p className="text-sm text-offside">{error}</p>
          </div>
        )}

        {!party && !error && (
          <p className="font-mono text-sm text-pitch-400 uppercase tracking-widest">Loading...</p>
        )}

        {party && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-turf uppercase tracking-widest">
                  Watch party
                </p>
                <h1 className="font-display text-3xl tracking-wide uppercase leading-none mt-1">
                  {party.name}
                </h1>
              </div>
              <button
                onClick={copyInviteLink}
                className="rounded-lg border border-pitch-800 hover:border-pitch-600 transition-colors px-4 py-2 text-sm font-medium"
              >
                {copied ? "Copied!" : "Copy invite"}
              </button>
            </div>

            <div className="surface p-4">
              <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest mb-3">
                Participants ({party.members.length})
              </p>
              <ul className="flex flex-wrap gap-2">
                {party.members.map((m) => (
                  <li
                    key={m.id}
                    className="font-mono text-xs px-2 py-1 rounded bg-pitch-950 border border-pitch-800"
                  >
                    {m.user.username}
                    {m.role === "HOST" && <span className="text-turf-light"> · host</span>}
                  </li>
                ))}
              </ul>
            </div>

            <RoomChat roomId={`watchparty:${party.id}`} />
          </div>
        )}
      </div>
    </main>
  );
}