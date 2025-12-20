"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { postLoadAction } from "./actions";

function PostLoadPageContent() {
  const router = useRouter();
  const [originZip, setOriginZip] = useState("");
  const [destinationZip, setDestinationZip] = useState("");
  const [loadWeight, setLoadWeight] = useState("");
  const [commodityType, setCommodityType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await postLoadAction({
        origin_zip: originZip,
        destination_zip: destinationZip,
        load_weight: parseFloat(loadWeight),
        commodity_type: commodityType,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setOriginZip("");
      setDestinationZip("");
      setLoadWeight("");
      setCommodityType("");

      // Redirect after brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <svg
            className="w-12 h-12 text-deep-green mx-auto"
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
          <h1 className="text-2xl font-semibold font-spartan text-white">
            Load Posted Successfully
          </h1>
          <p className="text-gray-400">
            Your load has been submitted and is now available for carriers. Redirecting to dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold font-spartan text-white mb-2">
          Post a New Load
        </h1>
        <p className="text-gray-400 mb-8">
          Submit your shipment details for carriers to view and bid on.
        </p>

        <div className="bg-white rounded-none p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-charcoal-black mb-2"
                htmlFor="origin_zip"
              >
                Origin ZIP Code
              </label>
              <input
                id="origin_zip"
                type="text"
                required
                maxLength={5}
                placeholder="e.g., 90210"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                className="w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-deep-green"
                aria-label="Origin ZIP Code"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-charcoal-black mb-2"
                htmlFor="destination_zip"
              >
                Destination ZIP Code
              </label>
              <input
                id="destination_zip"
                type="text"
                required
                maxLength={5}
                placeholder="e.g., 10001"
                value={destinationZip}
                onChange={(e) => setDestinationZip(e.target.value)}
                className="w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-deep-green"
                aria-label="Destination ZIP Code"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-charcoal-black mb-2"
                htmlFor="load_weight"
              >
                Load Weight (lbs)
              </label>
              <input
                id="load_weight"
                type="number"
                required
                min="1"
                step="1"
                placeholder="e.g., 5000"
                value={loadWeight}
                onChange={(e) => setLoadWeight(e.target.value)}
                className="w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-deep-green"
                aria-label="Load Weight"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-charcoal-black mb-2"
                htmlFor="commodity_type"
              >
                Commodity Type
              </label>
              <input
                id="commodity_type"
                type="text"
                required
                placeholder="e.g., Electronics, Furniture, Textiles"
                value={commodityType}
                onChange={(e) => setCommodityType(e.target.value)}
                className="w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-deep-green"
                aria-label="Commodity Type"
              />
            </div>

            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-green text-white rounded-none disabled:opacity-60 hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black transition font-semibold"
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
                <span>{loading ? "Submitting..." : "Submit Load"}</span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-300 text-charcoal-black rounded-none hover:bg-gray-400 focus:ring-2 focus:ring-charcoal-black transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

import PostLoadAccessCheck from "./access-check";

export default function PostLoadPage() {
  return (
    <PostLoadAccessCheck>
      <PostLoadPageContent />
    </PostLoadAccessCheck>
  );
}
