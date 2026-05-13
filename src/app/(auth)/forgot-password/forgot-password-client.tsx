"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo },
    );

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={72} className="mb-3 rounded-2xl shadow-sm" />
        <h1 className="text-3xl font-bold text-gray-900">Snap Expense</h1>
        <p className="mt-2 text-sm text-gray-500">
          Reset your password
        </p>
      </div>

      {submitted ? (
        <div className="w-full space-y-4">
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            If an account exists for <span className="font-medium">{email}</span>,
            we just sent a reset link. Check your inbox.
          </div>
          <Link
            href="/login"
            className="block w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <p className="mt-2 text-xs text-gray-500">
              We&rsquo;ll email a link to reset your password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
