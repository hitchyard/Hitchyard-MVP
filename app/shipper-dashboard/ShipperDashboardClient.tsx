"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, Calendar, Weight, DollarSign, TrendingUp, Plus, Loader2, CheckCircle, XCircle } from "lucide-react";
import AILoadMatcher from "./AILoadMatcher";
import { acceptBidAndPay } from "../actions/acceptBidAndPay";

interface Load {
  id: string;
  user_id: string;
  origin_city?: string;
  origin_state?: string;
  origin_zip: string;
  destination_city?: string;
  destination_state?: string;
  destination_zip: string;
  load_weight: number;
  commodity_type: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  status: string;
  assigned_carrier_id?: string;
  created_at: string;
}

interface Bid {
  id: string;
  load_id: string;
  carrier_id: string;
  bid_amount: number;
  status: string;
  created_at: string;
}

interface ShipperDashboardClientProps {
  loads: Load[];
  bids: Bid[];
  userId: string;
}

export default function ShipperDashboardClient({ loads, bids, userId }: ShipperDashboardClientProps) {
  const router = useRouter();
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [processingBidId, setProcessingBidId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePostLoad = () => {
    router.push("/post-load");
  };

  const handleAcceptBid = async (loadId: string, bidId: string, bidAmount: number) => {
    setProcessingBidId(bidId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Call PayCargo payment authorization server action
      const result = await acceptBidAndPay({
        loadId,
        bidId,
        winningBidAmount: bidAmount,
      });

      if (result.success) {
        setSuccessMessage(result.message || "Payment Authorized. Load Assigned.");
        // Refresh the page to show updated data
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setErrorMessage(result.error || "Payment authorization failed.");
      }
    } catch (error) {
      console.error("Accept bid error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingBidId(null);
    }
  };

  const getBidsForLoad = (loadId: string) => {
    return bids.filter((bid) => bid.load_id === loadId);
  };

  const formatLocation = (load: Load, type: "origin" | "destination") => {
    if (type === "origin") {
      return load.origin_city && load.origin_state
        ? `${load.origin_city}, ${load.origin_state}`
        : load.origin_zip;
    }
    return load.destination_city && load.destination_state
      ? `${load.destination_city}, ${load.destination_state}`
      : load.destination_zip;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "text-deep-forest-green";
      case "authorized":
        return "text-blue-400";
      case "assigned":
        return "text-blue-400";
      case "completed":
        return "text-gray-400";
      default:
        return "text-white/70";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION - Authority Top Bar */}
      <nav className="bg-charcoal-black border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase text-white">
            HITCHYARD
          </h1>
          <div className="flex gap-6 font-sans text-sm font-medium text-white">
            <a href="/shipper-dashboard" className="text-deep-forest-green">
              DASHBOARD
            </a>
            <a href="/post-load" className="hover:text-deep-forest-green transition">
              POST LOAD
            </a>
            <a href="#" className="hover:text-deep-forest-green transition">
              PROFILE
            </a>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-7xl mx-auto px-12 py-12">
          {/* SUCCESS/ERROR NOTIFICATIONS */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-sans text-green-800 font-semibold">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-sans text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* HEADER SECTION */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-5xl md:text-6xl font-serif font-extrabold uppercase tracking-tight text-charcoal-black mb-2">
                LOAD MANAGEMENT CENTER
              </h2>
              <p className="text-lg font-sans text-gray-600">
                {loads.length} active load{loads.length !== 1 ? "s" : ""} • {bids.length} total bid{bids.length !== 1 ? "s" : ""}
              </p>
            </div>
            
            {/* POST LOAD BUTTON */}
            <button
              onClick={handlePostLoad}
              className="bg-charcoal-black text-white font-sans font-semibold text-base px-8 py-4 hover:bg-deep-forest-green transition-all duration-300 uppercase tracking-wide flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              POST LOAD
            </button>
          </div>

          {/* LOADS TABLE */}
          {loads.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-serif font-bold uppercase text-charcoal-black mb-2">
                NO LOADS POSTED
              </h3>
              <p className="text-gray-500 font-sans mb-6">
                Start by posting your first load to the marketplace.
              </p>
              <button
                onClick={handlePostLoad}
                className="bg-charcoal-black text-white font-sans font-semibold px-6 py-3 hover:bg-deep-forest-green transition uppercase"
              >
                POST YOUR FIRST LOAD
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Load Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Bids
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loads.map((load) => {
                    const loadBids = getBidsForLoad(load.id);
                    const pendingBids = loadBids.filter((bid) => bid.status === "pending");

                    return (
                      <tr key={load.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-sans">
                            <div className="font-semibold text-charcoal-black">
                              {load.commodity_type || "Freight"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {load.id.slice(0, 8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-sans text-sm text-gray-700">
                            <div>{formatLocation(load, "origin")}</div>
                            <div className="text-gray-400">→</div>
                            <div>{formatLocation(load, "destination")}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-sans text-sm text-gray-700">
                            {load.load_weight.toLocaleString()} lbs
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-sans text-sm font-semibold uppercase ${getStatusColor(load.status)}`}>
                            {load.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-sans text-sm">
                            {loadBids.length > 0 ? (
                              <span className="text-charcoal-black font-semibold">
                                {pendingBids.length} pending
                              </span>
                            ) : (
                              <span className="text-gray-400">No bids</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {pendingBids.length > 0 && load.status === "open" ? (
                            <button
                              onClick={() => setSelectedLoadId(load.id === selectedLoadId ? null : load.id)}
                              className="bg-deep-forest-green text-white font-sans font-semibold text-xs px-4 py-2 hover:bg-green-800 transition uppercase"
                            >
                              {load.id === selectedLoadId ? "HIDE BIDS" : "REVIEW BIDS"}
                            </button>
                          ) : (
                            <span className="text-gray-400 font-sans text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* BID REVIEW SECTION */}
          {selectedLoadId && (
            <div className="mt-8 bg-white border border-gray-100 rounded-lg p-6">
              <h3 className="text-2xl font-serif font-bold uppercase text-charcoal-black mb-6">
                BIDS RECEIVED
              </h3>
              <div className="space-y-4">
                {getBidsForLoad(selectedLoadId)
                  .filter((bid) => bid.status === "pending")
                  .map((bid) => (
                    <div
                      key={bid.id}
                      className="flex justify-between items-center border-b border-gray-100 pb-4"
                    >
                      <div className="font-sans">
                        <div className="text-sm text-gray-500">Carrier ID: {bid.carrier_id.slice(0, 8)}</div>
                        <div className="text-lg font-semibold text-charcoal-black">
                          ${bid.bid_amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Submitted {formatDate(bid.created_at)}
                        </div>
                      </div>
                      
                      {/* ACCEPT BID BUTTON - PayCargo Integration */}
                      <button
                        onClick={() => handleAcceptBid(selectedLoadId, bid.id, bid.bid_amount)}
                        disabled={processingBidId === bid.id}
                        className="bg-deep-forest-green text-white font-sans font-semibold text-sm px-6 py-3 hover:bg-green-800 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processingBidId === bid.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AUTHORIZING...
                          </>
                        ) : (
                          "ACCEPT BID"
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>

        {/* AI SIDEBAR */}
        <AILoadMatcher loads={loads} bids={bids} />
      </div>
    </div>
  );
}
