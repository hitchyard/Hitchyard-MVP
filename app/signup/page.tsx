"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "./actions";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUpAction({
        email,
        password,
        zip_code: zipCode,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Successful signup — show success message
      setSuccess(true);
      setEmail("");
      setPassword("");
      setZipCode("");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center text-center space-y-4">
          <svg
            className="w-12 h-12 text-deep-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <h1 className="text-2xl font-semibold text-charcoal-black">
            Verification Email Sent
          </h1>

          <p className="text-sm text-gray-600">
            A Confirmation Link Has Been Sent to Your Email. Please Check Your Inbox to Verify Your Account and Proceed to Login.
          </p>

          <button
            onClick={() => setSuccess(false)}
            className="mt-6 inline-flex px-4 py-2 bg-deep-green text-white rounded-md hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black"
          >
            Back to Sign Up
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-charcoal-black">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-charcoal-black" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
            aria-label="Email"
          />
        <div>
          <label className="block text-sm font-medium mb-1 text-charcoal-black" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
            aria-label="Password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-charcoal-black" htmlFor="zip_code">
            ZIP Code
          </label>
          <input
            id="zip_code"
            type="text"
            required
            maxLength={5}
            placeholder="e.g., 90210"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
            aria-label="ZIP Code"
          />
        </div>

        {error && (

        {error && (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-deep-green text-white rounded-md disabled:opacity-60 hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}

            <span>{loading ? "Signing up..." : "Sign up"}</span>
          </button>
        </div>
      </form>
    </main>
  );
}
