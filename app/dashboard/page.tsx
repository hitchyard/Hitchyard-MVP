"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { supabase } from "../../utils/supabase/client";
import { acceptBidAction } from "./actions";
import Disclaimer from "../components/Disclaimer";
import PayoutsTable from "./PayoutsTable";
// TODO: Re-enable after PayCargo integration
// import { createConnectAccountLink } from "../actions/stripe";
// import PaymentSetupBanner from "../components/PaymentSetupBanner";

interface UserProfile {
  first_name: string | null;
  stripe_account_id: string | null;
  stripe_payment_method_id: string | null;
  user_role: string | null;
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
        <span className="text-[10px] text-white bg-[#0B1F1A] px-3 py-1 rounded-none uppercase tracking-[0.1em]">LOAD ASSIGNED</span>
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
      className="px-4 py-2 bg-charcoal-black text-white rounded-none hover:bg-[#0B1F1A] font-semibold text-[12px] uppercase tracking-[0.1em] disabled:opacity-60"
    >
      {pending ? "ASSIGNING..." : "ACCEPT BID"}
    </button>
  );
}

// TODO: Re-enable after PayCargo integration
/* function PayoutSetupBanner({ stripeAccountId }: { stripeAccountId: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSetupPayouts = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createConnectAccountLink();
        if (result.error) {
          setError(result.error);
        } else if (result.url) {
          router.push(result.url);
        }
      } catch (err) {
        setError((err as Error)?.message ?? "Failed to create payout link");
      }
    });
  };

  if (stripeAccountId) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-deep-green p-6 mb-8 rounded-none ">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-charcoal-black mb-2">
            Payout Setup Required
          </h3>
          <p className="text-gray-700 mb-4">
            You must connect a payout method to receive payments for accepted loads. Click below to set up your Stripe account.
          </p>
          <button
            onClick={handleSetupPayouts}
            disabled={isPending}
            className="px-6 py-3 bg-deep-green text-white font-semibold rounded-none hover:bg-[#0e2b26] disabled:opacity-60 transition"
          >
            {isPending ? "Redirecting..." : "Set Up Payouts (Required)"}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
} */

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
          .select("first_name, stripe_account_id, stripe_payment_method_id, user_role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
        } else if (data) {
          const profile = data as UserProfile;
          setFirstName(profile.first_name);
          setStripeAccountId(profile.stripe_account_id);
          setStripePaymentMethodId(profile.stripe_payment_method_id);
          setUserRole(profile.user_role);
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
          <div className="animate-spin inline-block w-8 h-8 border-4 border-deep-green border-t-transparent rounded-none"></div>
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
            className="mt-4 px-4 py-2 bg-deep-green text-white rounded-none hover:bg-[#0e2b26]"
          >
            Back to Sign Up
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-charcoal-black uppercase tracking-[0.4em] mb-2">
          COMMAND CENTER
        </h1>
        <p className="text-[12px] font-sans text-[#1A1D21]/60 uppercase tracking-[0.1em] mb-8">WELCOME, {firstName || "USER"}</p>

        {/* TODO: Re-enable after PayCargo integration */}
        {/* Payment Setup Banner for Shippers */}
        {/* {userRole === "shipper" && (
          <PaymentSetupBanner
            stripePaymentMethodId={stripePaymentMethodId}
            userRole={userRole}
            onPaymentAdded={() => setRefreshKey((k) => k + 1)}
          />
        )} */}

        {/* Payout Setup Banner for Carriers */}
        {/* {userRole === "carrier" && <PayoutSetupBanner stripeAccountId={stripeAccountId} />} */}

        <div className="mt-8 mb-12">
          <Link
            href="/post-load"
            className="inline-flex items-center justify-center px-6 py-3 bg-charcoal-black text-white rounded-none hover:bg-[#0B1F1A] focus:ring-2 focus:ring-charcoal-black transition font-semibold uppercase tracking-[0.1em] text-[12px]"
          >
            POST NEW LOAD
          </Link>
        </div>

        <PayoutsTable />

        {/* Your Posted Loads Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif font-bold text-charcoal-black mb-6 uppercase tracking-[0.4em]">
            YOUR POSTED LOADS
          </h2>

          {loads.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-none p-8 text-center">
              <p className="text-[#1A1D21]/60 text-[12px] uppercase tracking-[0.1em]">
                NO LOADS POSTED YET. START BY{" "}
                <Link href="/post-load" className="text-[#0B1F1A] hover:underline font-bold">
                  POSTING YOUR FIRST LOAD
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-none border border-gray-200">
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="text-left px-6 py-4 text-[12px] font-sans font-semibold text-charcoal-black uppercase tracking-[0.1em]">
                      Origin ZIP
                    </th>
                    <th className="text-left px-6 py-4 text-[12px] font-sans font-semibold text-charcoal-black uppercase tracking-[0.1em]">
                      Destination ZIP
                    </th>
                    <th className="text-left px-6 py-4 text-[12px] font-sans font-semibold text-charcoal-black uppercase tracking-[0.1em]">
                      Weight (lbs)
                    </th>
                    <th className="text-left px-6 py-4 text-[12px] font-sans font-semibold text-charcoal-black uppercase tracking-[0.1em]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-[12px] font-sans font-semibold text-charcoal-black uppercase tracking-[0.1em]">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map((load, index) => (
                    <React.Fragment key={load.id}>
                      <tr
                        className={`border-b border-gray-200 hover:bg-gray-50 transition`}
                      >
                        <td className="px-6 py-4 text-[#1A1D21]">{load.origin_zip}</td>
                        <td className="px-6 py-4 text-[#1A1D21]">{load.destination_zip}</td>
                        <td className="px-6 py-4 text-[#1A1D21]">{load.load_weight.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-none text-[10px] font-sans font-bold uppercase tracking-[0.1em] ${
                              load.status === "posted"
                                ? "bg-[#0B1F1A] text-white"
                                : load.status === "assigned"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#1A1D21]/60 text-[12px]">{new Date(load.created_at).toLocaleDateString()}</td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="max-w-4xl">
                            <h4 className="text-[12px] font-sans font-semibold text-charcoal-black mb-3 uppercase tracking-[0.1em]">RECEIVED BIDS</h4>
                            {(!bidsMap[load.id] || bidsMap[load.id].length === 0) ? (
                              <p className="text-[#1A1D21]/60 text-[12px] uppercase tracking-[0.1em]">NO BIDS YET FOR THIS LOAD.</p>
                            ) : (
                              <ul className="space-y-3">
                                {bidsMap[load.id].map((bid) => (
                                  <li key={bid.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-none p-3">
                                    <div>
                                      <div className="text-[#1A1D21] font-medium text-[12px]">CARRIER: {bid.carrier_id}</div>
                                      <div className="text-[#1A1D21]/60 text-[10px] uppercase tracking-[0.1em]">PLACED: {new Date(bid.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-charcoal-black font-semibold">${bid.bid_amount.toFixed(2)}</div>
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

      {/* IMPERIAL DISCLAIMER FOOTER */}
      <Disclaimer />
      </div>
    </main>
  );
}
