"use client";

import React, { useState } from "react";
import { submitBidAction } from "./actions";

type Props = {
  loadId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (message?: string) => void;
  isVerified?: boolean;
  trustScore?: number;
};

export default function BidModal({ loadId, open, onClose, onSuccess, isVerified = true, trustScore = 0 }: Props) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // BIDDING GUARD: Trust threshold check
      if (!isVerified || trustScore <= 70) {
        setMessage('LOW TRUST SCORE. ASSIGNMENT DENIED.');
        setLoading(false);
        return;
      }

      const bidValue = parseFloat(bidAmount);
      const res = await submitBidAction({ load_id: loadId, bid_amount: bidValue });

      if (res?.error) {
        setMessage(res.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setBidAmount("");
        // Close after 2 seconds
        setTimeout(() => {
          onSuccess?.("BID SUBMITTED. STAND BY FOR ASSIGNMENT.");
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setMessage((err as Error)?.message ?? String(err));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      {/* HIGH-CONTRAST FADE OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/90 transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* BIDDING PROTOCOL CONTAINER - Stark White */}
      <div className="relative w-full max-w-5xl mx-4 bg-white rounded-none py-[100px] px-12">
        {/* GRIT CLUB COMPLIANCE BADGE - Top Right */}
        <div className="absolute top-8 right-8 bg-[#0B1F1A] px-6 py-4 rounded-none">
          <p className="text-white font-sans text-[10px] uppercase tracking-[0.4em] font-bold">
            GRIT CLUB COMPLIANCE SECURED
          </p>
        </div>

        {/* CLOSE BUTTON - Top Left */}
        <button
          onClick={onClose}
          className="absolute top-8 left-8 text-[#1A1D21]/40 hover:text-[#1A1D21] transition-colors font-sans text-[10px] uppercase tracking-[0.4em] rounded-none"
        >
          CLOSE
        </button>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="text-center py-20">
            <h2 className="text-5xl md:text-6xl font-serif font-bold uppercase text-[#1A1D21] tracking-[0.4em] mb-8">
              BID SUBMITTED
            </h2>
            <p className="text-2xl font-serif uppercase text-[#0B1F1A] tracking-[0.4em]">
              STAND BY FOR ASSIGNMENT
            </p>
          </div>
        ) : !isVerified || trustScore <= 70 ? (
          /* REJECTION LOGIC - Unverified or Low Trust Carriers */
          <div className="text-center py-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold uppercase text-[#1A1D21]/30 tracking-[0.4em]">
              ACCESS RESTRICTED. COMPLIANCE REQUIRED.
            </h2>
          </div>
        ) : (
          /* BIDDING FORM - Verified Carriers */
          <form onSubmit={handleSubmit} className="space-y-16">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold uppercase text-[#1A1D21] mb-4 tracking-[0.4em]">
                BIDDING PROTOCOL
              </h2>
              <p className="text-[10px] font-sans uppercase text-[#1A1D21]/40 tracking-[0.4em]">
                LOAD ID: {loadId.slice(0, 8)}
              </p>
            </div>

            {/* IMPERIAL INPUT FIELD */}
            <div className="max-w-4xl mx-auto">
              <input
                id="bid_amount"
                name="bid_amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="ENTER BID AMOUNT"
                className="w-full border-b-2 border-[#1A1D21]/20 bg-transparent text-5xl font-serif text-center py-12 text-[#1A1D21] placeholder:text-[#1A1D21]/20 focus:border-[#1A1D21] outline-none transition-colors duration-300 rounded-none"
                disabled={loading}
              />
            </div>

            {/* ERROR MESSAGE */}
            {message && (
              <div className="text-center text-[12px] font-sans text-[#1A1D21]/60 uppercase tracking-[0.1em]">
                {message}
              </div>
            )}

            {/* SUBMIT BUTTON - Charcoal with Forest Green hover */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !bidAmount}
                className="bg-[#1A1D21] text-white font-sans font-bold text-[12px] py-6 px-16 hover:bg-[#0B1F1A] transition-all duration-300 uppercase tracking-[0.1em] disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
              >
                {loading ? "PROCESSING..." : "SUBMIT BID"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
