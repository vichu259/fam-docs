"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-9 h-9 bg-violet-600 rounded-lg mb-6" />
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-zinc-50 tracking-tight">
            Family Docs
          </h1>
          <p className="text-stone-400 dark:text-zinc-500 text-sm mt-1">
            Sign in to access your documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-300 dark:placeholder-zinc-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-300 dark:placeholder-zinc-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition"
            />
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-300 dark:text-zinc-700 mt-8">
          Invite-only access
        </p>
      </div>
    </div>
  );
}
