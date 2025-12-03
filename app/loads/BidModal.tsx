"use client";

import React, { useState } from "react";
import { submitBidAction } from "./actions";

type Props = {
  loadId: string;
  open: boolean;
  onClose: () => void;
};

export default function BidModal({ loadId, open, onClose }: Props) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const bidValue = parseFloat(bidAmount);
      const res = await submitBidAction({ load_id: loadId, bid_amount: bidValue });

      if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage(res?.message ?? "Bid submitted successfully.");
        setBidAmount("");
      }
    } catch (err) {
      setMessage((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-charcoal-black rounded-lg shadow-lg border border-gray-700 p-6">
        <h3 className="text-xl font-spartan font-semibold text-white mb-3">Place Your Bid</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="load_id" value={loadId} />

          <div>
            <label htmlFor="bid_amount" className="block text-sm font-medium text-gray-200 mb-1">
              Bid Amount (USD)
            </label>
            <input
              id="bid_amount"
              name="bid_amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-900 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-deep-green"
            />
          </div>

          {message && <div className="text-sm text-gray-200">{message}</div>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 bg-deep-green text-white rounded-md hover:bg-[#0e2b26] disabled:opacity-60 font-semibold"
            >
              {loading ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
