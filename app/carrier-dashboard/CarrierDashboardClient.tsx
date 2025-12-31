"use client";

import React, { useState, useEffect } from "react";
import { Package, MapPin, Calendar, Weight, DollarSign, Truck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import BidModal from "../loads/BidModal";
import Disclaimer from "../components/Disclaimer";
import { isInSweetSpot } from "@/utils/geo";
import { DocusealForm } from "@docuseal/react";

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
  insuranceVerified: boolean;
  mcNumberVerified: boolean;
  vettingStatus: 'PENDING' | 'ACTIVE' | 'REJECTED' | string;
  trustScore: number;
}

export default function CarrierDashboardClient({ 
  loads, 
  insuranceVerified,
  mcNumberVerified,
  vettingStatus: initialVettingStatus,
  trustScore: initialTrustScore
}: CarrierDashboardClientProps) {
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Real-time vetting status from Supabase
  const [vettingStatus, setVettingStatus] = useState(initialVettingStatus);
  const [trustScore, setTrustScore] = useState(initialTrustScore || 98);
  const [ansoniaCreditScore, setAnsoniaCreditScore] = useState<number | null>(98);
  const [ansoniaDtpDays, setAnsoniaDtpDays] = useState<number | null>(12);
  const [allowedToOperate, setAllowedToOperate] = useState<"Y" | "N" | "UNKNOWN">("UNKNOWN");

  // Set up real-time subscription to user_profiles changes
  useEffect(() => {
    if (!supabaseConfigured) {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const channel = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
        },
        (payload) => {
          if (payload.new) {
            if (payload.new.vetting_status) {
              setVettingStatus(payload.new.vetting_status);
            }
            if (payload.new.trust_score !== undefined) {
              setTrustScore(payload.new.trust_score);
            }
            if (payload.new.ansonia_credit_score !== undefined) {
              setAnsoniaCreditScore(payload.new.ansonia_credit_score);
            }
            if (payload.new.ansonia_dtp_days !== undefined) {
              setAnsoniaDtpDays(payload.new.ansonia_dtp_days);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseConfigured]);

  // Fetch FMCSA compliance (Green Light) using MC from registrations
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    const sb = createClient(supabaseUrl, supabaseKey);

    (async () => {
      const { data: auth } = await sb.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const { data: reg } = await sb.from('registrations').select('mc_number').eq('user_id', userId).single();
      const mc = reg?.mc_number;
      if (!mc) return;
      try {
        const res = await fetch('/api/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mcNumber: mc }),
        });
        const json = await res.json();
        if (json?.success && json?.data?.allowedToOperate) {
          setAllowedToOperate(json.data.allowedToOperate);
          setFmCarrierName(json?.data?.carrierName);
          setFmCarrierMc(json?.data?.mcNumber || mc);
          // If GREEN LIGHT, ensure Docuseal embed renders
          setDocusealUrl(process.env.NEXT_PUBLIC_DOCUSEAL_FORM_URL || null);
        }
      } catch (e) {
        console.error('FMCSA compliance fetch failed', e);
      }
    })();
  }, []);

  const isVerified = (allowedToOperate === 'Y') || (insuranceVerified && mcNumberVerified);

  // Docuseal prefill values from registrations
  const [docusealPrefill, setDocusealPrefill] = useState<{ [key: string]: string | undefined }>({});
  const [docusealUrl, setDocusealUrl] = useState<string | null>(null);
  const [fmCarrierName, setFmCarrierName] = useState<string | undefined>(undefined);
  const [fmCarrierMc, setFmCarrierMc] = useState<string | undefined>(undefined);
  const [fmCarrierName, setFmCarrierName] = useState<string | undefined>(undefined);
  const [fmCarrierMc, setFmCarrierMc] = useState<string | undefined>(undefined);
  const [datManualRequired, setDatManualRequired] = useState<boolean>(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    const supabase = createClient(supabaseUrl, supabaseKey);

    setDocusealUrl(process.env.NEXT_PUBLIC_DOCUSEAL_FORM_URL || null);
    const today = new Date().toISOString().split('T')[0];

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setDocusealPrefill({ date: today });
        return;
      }
      const { data: reg } = await supabase
        .from('registrations')
        .select('company_name, mc_number')
        .eq('user_id', userId)
        .single();
      setDocusealPrefill({
        'CARRIER': fmCarrierName ?? reg?.company_name ?? undefined,
        'MC#': fmCarrierMc ?? reg?.mc_number ?? undefined,
        'date': today,
      });

      const mcForDat = fmCarrierMc ?? reg?.mc_number;
      if (mcForDat) {
        try {
          const res = await fetch('/api/dat/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mcNumber: mcForDat }),
          });
          const json = await res.json();
          setDatManualRequired(Boolean(json?.manualRequired));
        } catch (e) {
          setDatManualRequired(true);
        }
      }
    })();
  }, [fmCarrierName, fmCarrierMc]);

  const handleApplyToLoad = (load: Load) => {
    setSelectedLoad(load);
    setBidModalOpen(true);
  };

  const handleBidSuccess = (message?: string) => {
    setSuccessMessage(message || "BID SUBMITTED. STAND BY FOR ASSIGNMENT.");
    setBidModalOpen(false);
    // Clear success message after 4 seconds
    setTimeout(() => setSuccessMessage(null), 4000);
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
      {/* REJECTED STATUS - Imperial Standard Not Met Screen */}
      {vettingStatus === 'REJECTED' && (
        <main className="min-h-screen flex items-center justify-center py-[200px] px-6 text-center">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl tracking-[0.8em] uppercase text-white mb-12">
              IMPERIAL STANDARD NOT MET
            </h1>
            <p className="font-serif text-2xl md:text-3xl tracking-[0.8em] uppercase text-white mb-16">
              CREDIT SCORE BELOW THRESHOLD
            </p>
            <div className="bg-white/5 p-12 rounded-none mb-12">
              <p className="text-white font-sans text-sm tracking-[0.8em] uppercase mb-4">Your Trust Score</p>
              <p className="text-6xl font-serif font-bold text-white mb-6">{trustScore}</p>
              <p className="text-white font-sans text-xs tracking-[0.8em] uppercase">
                Minimum required: 70
              </p>
            </div>
            <p className="text-white font-sans text-sm tracking-[0.8em] leading-relaxed max-w-2xl mx-auto uppercase">
              Your application has been reviewed. Unfortunately, your current credit profile does not meet
              the Grit Club's minimum standards. You may reapply in 90 days or contact our support team
              for additional options.
            </p>
          </div>
          <Disclaimer />
        </main>
      )}

      {/* NORMAL DASHBOARD (ACTIVE or PENDING) */}
      {vettingStatus !== 'REJECTED' && (
        <>
          {/* NAVIGATION - Authority Top Bar */}
          <nav className="bg-charcoal-black border-b border-white/10 py-4 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-serif font-bold uppercase text-white tracking-[0.4em]">
                  HITCHYARD
                </h1>
                <span className="text-white/40 font-sans text-[10px] uppercase tracking-[0.4em]">
                  // SYSTEM ACTIVE
                </span>
              </div>
              <div className="flex gap-6 font-sans text-[10px] font-medium text-white items-center uppercase tracking-[0.4em]">
                {/* GREEN LIGHT / COMPLIANCE BADGE */}
                {isVerified && (
                  <div className="bg-[#0B1F1A] px-4 py-2 rounded-none">
                    <span className="text-white font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                      ✓ GREEN LIGHT: COMPLIANCE VERIFIED
                    </span>
                  </div>
                )}
                <a href="/carrier-dashboard" className="text-deep-forest-green">
                  COMMAND CENTER
                </a>
                <a href="/loads" className="hover:text-deep-forest-green transition">
                  MY BIDS
                </a>
                <a href="/vetting" className="hover:text-deep-forest-green transition">
                  PROTOCOL
                </a>
                <a href="#" className="hover:text-deep-forest-green transition">
                  SETTLEMENTS
                </a>
              </div>
            </div>
          </nav>

      {/* STATUS SECTION - Imperial Authority 200px Padding */}
      <section className="py-[200px] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold uppercase text-white mb-12 tracking-[0.8em]">
            QUALIFICATION STATUS
          </h2>
          {!isVerified ? (
            <>
              <p className="text-3xl md:text-4xl font-serif uppercase text-deep-forest-green tracking-[0.8em] mb-12">
                QUALIFICATION IN PROGRESS
              </p>
              <p className="text-sm font-sans text-white leading-relaxed max-w-2xl mx-auto tracking-[0.8em] mb-12 uppercase">
                Your compliance is under review. You may browse available loads,
                but bidding will be enabled once your FMCSA and insurance are verified.
              </p>
              <div className="space-y-4 text-xs font-sans text-white uppercase tracking-[0.8em]">
                {allowedToOperate !== 'Y' && <p>• FMCSA COMPLIANCE PENDING</p>}
                {!insuranceVerified && <p>• INSURANCE VERIFICATION PENDING</p>}
              </div>
              {datManualRequired && (
                <div className="flex items-center gap-2 mt-6 justify-center">
                  <span className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 border border-blue-400 rounded animate-pulse">
                    DAT Manual Verification Pending
                  </span>
                  <span className="text-xs text-gray-400 italic">
                    Check MC# {fmCarrierMc ?? (docusealPrefill['MC#'] || '')} in DAT One App
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-3xl md:text-4xl font-serif uppercase text-deep-forest-green tracking-[0.8em]">
              VERIFIED
            </p>
          )}
          {/* Docuseal Signature Panel */}
          <div className="mt-16">
            <h3 className="text-sm font-sans text-white uppercase tracking-[0.8em] mb-6">BROKER–CARRIER AGREEMENT</h3>
            {isVerified && docusealUrl ? (
              <div className="bg-white p-6">
                <DocusealForm src={docusealUrl} initialValues={docusealPrefill} />
              </div>
            ) : (
              <p className="text-white/60 font-sans text-xs uppercase tracking-[0.6em]">Docuseal portal URL not configured</p>
            )}
          </div>
        </div>
      </section>

      {/* CREDIT PROFILE DISPLAY */}
      {ansoniaCreditScore !== null && (
        <section className="py-[200px] border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-sm font-sans text-white uppercase tracking-[0.8em] mb-6">ANSONIA CREDIT PROFILE</h3>
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white/5 p-6 rounded-none">
                <p className="text-xs font-sans text-white uppercase tracking-[0.8em] mb-3">CREDIT SCORE</p>
                <p className="text-4xl font-serif font-bold text-white">{ansoniaCreditScore}</p>
                <p className="text-xs font-sans text-white uppercase tracking-[0.8em] mt-3">
                  {ansoniaCreditScore > 87 ? 'EXCELLENT' : ansoniaCreditScore >= 70 ? 'ACCEPTABLE' : 'REVIEW REQUIRED'}
                </p>
              </div>
              {ansoniaDtpDays !== null && (
                <div className="bg-white/5 p-6 rounded-none">
                  <p className="text-xs font-sans text-white uppercase tracking-[0.8em] mb-3">DAYS TO PAY</p>
                  <p className="text-4xl font-serif font-bold text-white">{ansoniaDtpDays}</p>
                  <p className="text-xs font-sans text-white uppercase tracking-[0.8em] mt-3">AVERAGE</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-24">

        {/* HEADER SECTION */}
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold uppercase tracking-[0.4em] text-white mb-6">
            THE SELECTION
          </h2>
          <p className="text-[12px] font-sans text-white uppercase tracking-[0.1em]">
            {loads.length} VERIFIED LOAD{loads.length !== 1 ? "S" : ""}
          </p>
        </div>

        {/* SINGLE-COLUMN VERTICAL LIST */}
        {loads.length === 0 ? (
          <div className="text-center py-32">
            <Truck className="w-16 h-16 mx-auto mb-8 text-white/20" />
              <h3 className="text-3xl font-serif font-bold uppercase text-white mb-4 tracking-[0.8em]">
              NO LOADS AVAILABLE
            </h3>
              <p className="text-white font-sans text-sm uppercase tracking-[0.8em]">
              Check back soon for new lane postings.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 relative">
            {/* PENDING OVERLAY */}
            {vettingStatus === 'PENDING' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"></div>
                <div className="relative z-30 text-center px-6">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold uppercase tracking-[0.8em] text-white">
                    ACCESS RESTRICTED. GRIT CLUB CLEARANCE REQUIRED.
                  </h3>
                </div>
              </div>
            )}
            {loads.map((load, index) => {
              const inSweetSpot = isInSweetSpot(load.origin_zip, load.destination_zip);
              return (
              <div
                key={load.id}
                className={`bg-white/5 p-12 ${vettingStatus === 'PENDING' ? 'pointer-events-none filter blur-[1px]' : ''} hover:bg-white/10 transition-all duration-700 rounded-none relative animate-fade-in-up ${inSweetSpot ? 'border border-[#0B1F1A]' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* VERIFIED BADGE - Deep Forest Green */}
                <div className="absolute top-6 right-6 bg-[#0B1F1A] px-4 py-2">
                  <span className="text-white font-sans text-xs uppercase tracking-[0.2em] font-bold">
                    VERIFIED
                  </span>
                </div>
                {/* SWEET SPOT INDICATOR - Registered Radius */}
                {inSweetSpot && (
                  <div className="absolute top-6 left-6 border border-[#0B1F1A] px-3 py-1">
                    <span className="text-[#0B1F1A] font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                      [ REGISTERED RADIUS ]
                    </span>
                  </div>
                )}
                {/* LOAD TITLE - Cinzel Large */}
                <h3 className="text-3xl font-serif font-bold uppercase text-white mb-10 tracking-[0.8em] pr-32">
                  {load.commodity_type || "FREIGHT"}
                </h3>

                {/* LOAD DETAILS */}
                <div className="space-y-6 mb-12 font-sans text-sm">
                  {/* Origin */}
                  <div className="flex items-start gap-2 text-white">
                    <MapPin className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white text-xs uppercase block tracking-[0.8em]">Origin</span>
                      <span>{formatLocation(load, "origin")}</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2 text-white">
                    <MapPin className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white text-xs uppercase block tracking-[0.8em]">Destination</span>
                      <span>{formatLocation(load, "destination")}</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-start gap-2 text-white">
                    <Weight className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                    <div>
                      <span className="text-white text-xs uppercase block tracking-[0.8em]">Weight</span>
                      <span>{load.load_weight.toLocaleString()} lbs</span>
                    </div>
                  </div>

                  {/* Pickup Date */}
                  {load.pickup_date && (
                    <div className="flex items-start gap-2 text-white">
                      <Calendar className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                      <div>
                        <span className="text-white text-xs uppercase block tracking-[0.8em]">Pickup</span>
                        <span>{formatDate(load.pickup_date)}</span>
                      </div>
                    </div>
                  )}

                  {/* Rate (if available) */}
                  {load.rate && (
                    <div className="flex items-start gap-2 text-white">
                      <DollarSign className="w-4 h-4 mt-0.5 text-deep-forest-green flex-shrink-0" />
                      <div>
                        <span className="text-white text-xs uppercase block tracking-[0.8em]">Rate</span>
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
                  className="w-full bg-charcoal-black text-white font-sans font-bold text-sm py-4 px-8 hover:bg-white/10 transition-all duration-700 uppercase tracking-[0.3em] border-none rounded-none"
                >
                  APPLY TO LOAD
                </button>
              </div>
            );
            })}
          </div>
        )}
      </main>
      {/* IMPERIAL DISCLAIMER FOOTER */}
      <Disclaimer />

      {/* BIDDING PROTOCOL MODAL */}
      {selectedLoad && (
        <BidModal
          loadId={selectedLoad.id}
          open={bidModalOpen}
          onClose={() => {
            setBidModalOpen(false);
            setSelectedLoad(null);
          }}
          onSuccess={handleBidSuccess}
          isVerified={isVerified}
          trustScore={trustScore}
        />
      )}

      {/* SUCCESS MESSAGE - Imperial Toast */}
      {successMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] bg-[#0B1F1A] px-12 py-6">
          <p className="text-white font-serif text-xl uppercase tracking-[0.8em] text-center">
            {successMessage}
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
