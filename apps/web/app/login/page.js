"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "../../lib/api";
import Logo from "../../components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await api.login(form.email, form.password);
      setAccessToken(accessToken);
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8">
      <div className="mb-8"><Logo /></div>

      <form onSubmit={handleSubmit} className="surface max-w-sm w-full p-6 space-y-5">
        <div>
          <h1 className="font-display text-2xl tracking-wide uppercase">Log in</h1>
          <p className="text-sm text-pitch-400 mt-1">Back to the terrace.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-3 py-2 text-sm outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="font-mono text-[11px] text-pitch-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg bg-pitch-950 border border-pitch-800 focus:border-turf px-3 py-2 text-sm outline-none transition-colors"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-offside">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-turf hover:bg-turf-light disabled:opacity-50 transition-colors py-2.5 text-sm font-medium text-pitch-950"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-pitch-400 text-center">
          No account yet? <a href="/register" className="text-turf-light">Register</a>
        </p>
      </form>
    </main>
  );
}
