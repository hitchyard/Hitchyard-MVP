"use client";

import React, { useState } from "react";
import BidModal from "./BidModal";

type Load = {
  id: string;
  origin_zip: string;
  destination_zip: string;
  load_weight: number;
  commodity_type: string;
  status: string;
  created_at: string;
};

type Props = {
  loads: Load[];
};

export default function LoadsClient({ loads }: Props) {
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const openModal = (loadId: string) => {
    setSelectedLoadId(loadId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLoadId(null);
  };

  const handleBidSuccess = (message?: string) => {
    // Close modal, show toast
    setModalOpen(false);
    setSelectedLoadId(null);
    setToastMessage(message ?? "Bid submitted successfully.");
    setShowToast(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div>
      <section>
        {loads.length === 0 ? (
          <div className="bg-white bg-opacity-5 p-12 text-center rounded-none">
            <p className="text-gray-400 text-lg">No loads available at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-700 rounded-none">
            <table className="w-full bg-white bg-opacity-5">
              <thead>
                <tr className="border-b border-gray-700 bg-charcoal-black">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Origin ZIP</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Destination ZIP</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Weight (lbs)</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Commodity Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Posted</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {loads.map((load, index) => (
                  <tr
                    key={load.id}
                    className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-opacity-3" : "bg-opacity-1"} hover:bg-opacity-5 transition`}
                  >
                    <td className="px-6 py-4 text-gray-200 font-medium">{load.origin_zip}</td>
                    <td className="px-6 py-4 text-gray-200 font-medium">{load.destination_zip}</td>
                    <td className="px-6 py-4 text-gray-200">{load.load_weight.toLocaleString()} lbs</td>
                    <td className="px-6 py-4 text-gray-200">{load.commodity_type}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(load.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(load.id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-deep-green text-white hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black transition font-semibold text-sm rounded-none"
                        aria-label={`Bid on load from ${load.origin_zip} to ${load.destination_zip}`}
                      >
                        Bid on Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <BidModal 
        loadId={selectedLoadId ?? ""} 
        open={modalOpen} 
        onClose={closeModal} 
        onSuccess={handleBidSuccess}
        isVerified={true}
      />

      {/* Imperial Toast Notification */}
      {showToast && toastMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100]">
          <div className="bg-[#0B1F1A] px-12 py-6 ">
            <p className="text-white font-serif text-xl uppercase tracking-[0.4em] text-center">
              {toastMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
