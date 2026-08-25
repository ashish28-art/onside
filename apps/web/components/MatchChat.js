"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import { api, getAccessToken, setAccessToken } from "../lib/api";

export default function MatchChat({ matchId }) {
  const [authStatus, setAuthStatus] = useState("checking");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [presenceCount, setPresenceCount] = useState(0);
  const [draft, setDraft] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (!getAccessToken()) {
          const { accessToken } = await api.refresh();
          setAccessToken(accessToken);
        }
        setAuthStatus("loggedIn");
      } catch {
        setAuthStatus("loggedOut");
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (authStatus !== "loggedIn") return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:room", { roomId: `match:${matchId}` });
    });

    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("presence:update", ({ count }) => {
      setPresenceCount(count);
    });

    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.off("connect");
      socket.off("chat:message");
      socket.off("presence:update");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [authStatus, matchId]);

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.emit("chat:send", {
      roomId: `match:${matchId}`,
      content: draft,
    });
    setDraft("");
  }

  if (authStatus === "checking") {
    return (
      <div className="surface p-4">
        <p className="font-mono text-xs text-pitch-400 uppercase tracking-widest">
          Checking session...
        </p>
      </div>
    );
  }

  if (authStatus === "loggedOut") {
    return (
      <div className="surface p-4">
        <p className="text-sm text-pitch-400">
          <a href="/login" className="text-turf-light">Log in</a> to join the match chat.
        </p>
      </div>
    );
  }

  return (
    <div className="surface p-4 flex flex-col h-96">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest">
          Match chat
        </p>
        <p className="font-mono text-[11px] text-turf uppercase tracking-widest">
          {connected ? `${presenceCount} watching` : "connecting..."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.length === 0 && (
          <p className="text-xs text-pitch-400">No messages yet -- say something.</p>
        )}
        {messages.map((msg, i) => (
                    <p key={i} className="text-sm">
            <span className="font-mono text-xs text-turf-light">{msg.username}</span>
            <span className="text-pitch-400 mx-1">·</span>
            {msg.content}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something..."
          className="flex-1 rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-3 py-2 text-sm outline-none transition-colors"
        />
        <button
          type="submit"
          className="rounded-lg bg-turf hover:bg-turf-light transition-colors px-4 py-2 text-sm font-medium text-pitch-950"
        >
          Send
        </button>
      </form>
    </div>
  );
}