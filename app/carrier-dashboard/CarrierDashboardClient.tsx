"use client";

import React, { useState } from "react";
import { Package, MapPin, Calendar, Weight, DollarSign, Truck } from "lucide-react";

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
  created_at: string;
}

interface CarrierDashboardClientProps {
  loads: Load[];
}

export default function CarrierDashboardClient({ loads }: CarrierDashboardClientProps) {
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const handleApplyToLoad = (load: Load) => {
    console.log("Applying to load:", load.id);
    setSelectedLoad(load);
    // TODO: Open bid modal or navigate to bid page
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

  return (
    <div className="min-h-screen bg-charcoal-black">
      {/* NAVIGATION - Authority Top Bar */}
      <nav className="bg-charcoal-black border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase text-white">
            HITCHYARD
          </h1>
          <div className="flex gap-6 font-sans text-sm font-medium text-white">
            <a href="/carrier-dashboard" className="text-deep-forest-green">
              DASHBOARD
            </a>
            <a href="/loads" className="hover:text-deep-forest-green transition">
              MY BIDS
            </a>
            <a href="#" className="hover:text-deep-forest-green transition">
              PROFILE
            </a>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER SECTION */}
        <div className="mb-12">
          <h2 className="text-5xl md:text-6xl font-serif font-extrabold uppercase tracking-tight text-white mb-4">
            LOADS AVAILABLE FOR BIDDING
          </h2>
          <p className="text-lg font-sans text-white/70">
            {loads.length} verified load{loads.length !== 1 ? "s" : ""} ready for carrier application
          </p>
        </div>

        {/* LOADS GRID */}
        {loads.length === 0 ? (
          <div className="text-center py-20">
            <Truck className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-2xl font-serif font-bold uppercase text-white mb-2">
              NO LOADS AVAILABLE
            </h3>
            <p className="text-white/60 font-sans">
              Check back soon for new load postings.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loads.map((load) => (
              <div
                key={load.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-deep-forest-green transition-all duration-300"
              >
                {/* LOAD TITLE - Cinzel Large */}
                <h3 className="text-2xl font-serif font-bold uppercase text-white mb-4 tracking-tight">
                  {load.commodity_type || "FREIGHT"}
                </h3>

                {/* LOAD DETAILS */}
                <div className="space-y-3 mb-6 font-sans text-sm">
                  {/* Origin */}
                  <div className="flex items-start gap-2 text-white/80">
                    <MapPin className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white/50 text-xs uppercase block">Origin</span>
                      <span>{formatLocation(load, "origin")}</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2 text-white/80">
                    <MapPin className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white/50 text-xs uppercase block">Destination</span>
                      <span>{formatLocation(load, "destination")}</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-start gap-2 text-white/80">
                    <Weight className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white/50 text-xs uppercase block">Weight</span>
                      <span>{load.load_weight.toLocaleString()} lbs</span>
                    </div>
                  </div>

                  {/* Pickup Date */}
                  {load.pickup_date && (
                    <div className="flex items-start gap-2 text-white/80">
                      <Calendar className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                      <div>
                        <span className="text-white/50 text-xs uppercase block">Pickup</span>
                        <span>{formatDate(load.pickup_date)}</span>
                      </div>
                    </div>
                  )}

                  {/* Rate (if available) */}
                  {load.rate && (
                    <div className="flex items-start gap-2 text-white/80">
                      <DollarSign className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                      <div>
                        <span className="text-white/50 text-xs uppercase block">Rate</span>
                        <span className="text-white font-semibold">
                          ${load.rate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* APPLY BUTTON */}
                <button
                  onClick={() => handleApplyToLoad(load)}
                  className="w-full bg-charcoal-black text-white font-sans font-semibold text-sm py-3 px-6 hover:bg-deep-forest-green transition-all duration-300 uppercase tracking-wide border border-white/20"
                >
                  APPLY TO LOAD
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto text-center font-sans text-sm text-white/50">
          <p>© 2025 HITCHYARD. The Standard in Enterprise Logistics.</p>
        </div>
      </footer>
    </div>
  );
}
