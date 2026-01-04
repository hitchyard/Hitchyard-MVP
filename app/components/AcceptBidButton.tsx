'use client';

import { useState } from 'react';
import { processFreightPayment } from '@/app/actions/processFreightPayment';

export default function AcceptBidButton({ load }: { load: any }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!confirm("Are you sure? This will generate legal BOLs and sync to QuickBooks.")) return;
    
    setLoading(true);
    try {
      const result = await processFreightPayment({
        loadId: load.id,
        baseRate: load.rate,           // Your service fee
        carrierCost: load.carrierFee,  // The pass-through freight cost
        bolData: {
          bolNumber: `BOL-${load.id.slice(0, 8).toUpperCase()}`,
          shipper_name: load.shipper_name,
          consignee_name: load.consignee_name,
          carrier_name: load.carrier_name,
          carrier_dot: load.carrier_dot,
        },
        qbInvoiceId: load.qb_invoice_id
      });

      if (result.success) {
        alert("Workflow Complete: PDF archived and QuickBooks updated.");
        window.location.reload(); // Refresh to show updated status
      } else {
        alert(`Issue detected: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className="w-full py-3 rounded-none bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
    >
      {loading ? "Processing Documents..." : "Finalize & Send Invoice"}
    </button>
  );
}
