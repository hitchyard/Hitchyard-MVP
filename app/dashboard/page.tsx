"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { supabase } from "../../utils/supabase/client";
import { acceptBidAction } from "./actions";

interface UserProfile {
  first_name: string | null;
}

interface Load {
  id: string;
  origin_zip: string;
  destination_zip: string;
  load_weight: number;
  status: string;
  created_at: string;
}

interface Bid {
  id: string;
  load_id: string;
  carrier_id: string;
  bid_amount: number;
  created_at: string;
}

const initialAcceptState = {
  success: false,
  message: "",
  error: "",
};

function AcceptBidButton({
  loadId,
  bidId,
  onSuccess,
}: {
  loadId: string;
  bidId: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(acceptBidAction, initialAcceptState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      onSuccess();
      router.refresh();
      return () => clearTimeout(timer);
    }
  }, [state.success, router, onSuccess]);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="load_id" value={loadId} />
      <input type="hidden" name="bid_id" value={bidId} />
      <SubmitButton />
      {showSuccess && (
        <span className="text-sm text-white bg-deep-green px-3 py-1 rounded-md">Load assigned</span>
      )}
      {state.error && <span className="text-sm text-red-500">{state.error}</span>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-deep-green text-white rounded-md hover:bg-[#0e2b26] font-semibold disabled:opacity-60"
    >
      {pending ? "Assigning..." : "Accept Bid"}
    </button>
  );
}
export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [bidsMap, setBidsMap] = useState<Record<string, Bid[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const sb = supabase();

        // Check if user is logged in
        const {
          data: { user },
          error: authError,
        } = await sb.auth.getUser();

        if (authError || !user) {
          // User not logged in, redirect to signup
          router.push("/signup");
          return;
        }

        // Fetch user profile
        const { data, error: profileError } = await sb
          .from("user_profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
        } else if (data) {
          setFirstName((data as UserProfile).first_name);
        }

        // Fetch user's loads
        const { data: loadsData, error: loadsError } = await sb
          .from("loads")
          .select("id, origin_zip, destination_zip, load_weight, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (loadsError) {
          setError(loadsError.message);
        } else if (loadsData) {
          setLoads(loadsData as Load[]);
          // Fetch bids for these loads
          try {
            const loadIds = (loadsData as Load[]).map((l) => l.id);
            if (loadIds.length > 0) {
              const { data: bidsData, error: bidsError } = await sb
                .from("bids")
                .select("id, load_id, carrier_id, bid_amount, created_at")
                .in("load_id", loadIds);

              if (bidsError) {
                // don't block dashboard if bids fail; just log
                console.error("Error fetching bids:", bidsError.message);
              } else if (bidsData) {
                const map: Record<string, Bid[]> = {};
                (bidsData as Bid[]).forEach((b) => {
                  if (!map[b.load_id]) map[b.load_id] = [];
                  map[b.load_id].push(b);
                });
                setBidsMap(map);
              }
            }
          } catch (err) {
            console.error("Unexpected error fetching bids:", err);
          }
        }
      } catch (err) {
        setError((err as Error)?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [router, refreshKey]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-deep-green border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/signup")}
            className="mt-4 px-4 py-2 bg-deep-green text-white rounded-md hover:bg-[#0e2b26]"
          >
            Back to Sign Up
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold font-spartan text-white mb-2">
          Welcome, {firstName || "User"}
        </h1>
        <p className="text-gray-400 mb-8">Manage and post your loads here.</p>

        <div className="mt-8 mb-12">
          <Link
            href="/post-load"
            className="inline-flex items-center justify-center px-6 py-3 bg-deep-green text-white rounded-md hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black transition font-semibold"
          >
            Post a New Load
          </Link>
        </div>

        {/* Your Posted Loads Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold font-spartan text-white mb-6">
            Your Posted Loads
          </h2>

          {loads.length === 0 ? (
            <div className="bg-white bg-opacity-5 rounded-lg p-8 text-center">
              <p className="text-gray-400">
                No loads posted yet. Start by{" "}
                <Link href="/post-load" className="text-deep-green hover:underline">
                  posting your first load
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full bg-white bg-opacity-5">
                <thead>
                  <tr className="border-b border-gray-700 bg-charcoal-black">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                      Origin ZIP
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                      Destination ZIP
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                      Weight (lbs)
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map((load, index) => (
                    <React.Fragment key={load.id}>
                      <tr
                        className={`border-b border-gray-700 ${
                          index % 2 === 0 ? "bg-opacity-3" : "bg-opacity-1"
                        } hover:bg-opacity-5 transition`}
                      >
                        <td className="px-6 py-4 text-gray-200">{load.origin_zip}</td>
                        <td className="px-6 py-4 text-gray-200">{load.destination_zip}</td>
                        <td className="px-6 py-4 text-gray-200">{load.load_weight.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              load.status === "posted"
                                ? "bg-deep-green text-white"
                                : load.status === "assigned"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{new Date(load.created_at).toLocaleDateString()}</td>
                      </tr>

                      <tr className="border-b border-gray-800">
                        <td colSpan={5} className="px-6 py-4 bg-white bg-opacity-2">
                          <div className="max-w-4xl">
                            <h4 className="text-sm font-semibold text-white mb-3">Received Bids</h4>
                            {(!bidsMap[load.id] || bidsMap[load.id].length === 0) ? (
                              <p className="text-gray-400">No bids yet for this load.</p>
                            ) : (
                              <ul className="space-y-3">
                                {bidsMap[load.id].map((bid) => (
                                  <li key={bid.id} className="flex items-center justify-between bg-white bg-opacity-3 rounded-md p-3">
                                    <div>
                                      <div className="text-gray-200 font-medium">Carrier: {bid.carrier_id}</div>
                                      <div className="text-gray-400 text-sm">Placed: {new Date(bid.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-white font-semibold">${bid.bid_amount.toFixed(2)}</div>
                                      <AcceptBidButton
                                        loadId={bid.load_id}
                                        bidId={bid.id}
                                        onSuccess={() => setRefreshKey((k) => k + 1)}
                                      />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
