"use client";

import React, { useEffect, useMemo, useState } from "react";

interface PayoutRow {
  realmId: string;
  loadNumber: string;
  shipperPaid: number;
  carrierOwed: number;
  carrierName?: string;
  billId?: string;
  finalTotal?: number;
}

export default function PayoutsTable() {
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_CRON_SECRET) {
        headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`;
      }

      const res = await fetch("/api/cron/sync-payments", { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const json = await res.json();
      const flattened: PayoutRow[] = (json.data || []).flatMap((company: any) => {
        const realmId = company.realmId ?? "N/A";
        const payouts = company.pending_payouts || [];
        return payouts.map((p: any) => ({
          realmId,
          loadNumber: p.loadNumber ?? "—",
          shipperPaid: p.shipperPaid ?? 0,
          carrierOwed: p.carrierOwed ?? 0,
          carrierName: p.carrierName ?? "Unknown",
          billId: p.billId ?? p.billID ?? undefined,
          finalTotal: p.finalTotal ?? undefined,
        }));
      });

      setRows(flattened);
    } catch (err) {
      setError((err as Error)?.message ?? "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasData = rows.length > 0;

  const formatMoney = (value: number) =>
    `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 text-[#1A1D21]/70 text-sm">
          <div className="h-5 w-5 border-2 border-[#0B1F1A] border-t-transparent animate-spin" />
          <span>Loading pending payouts...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-4">
          {error}
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="text-[12px] uppercase tracking-[0.1em] text-[#1A1D21]/60 bg-white border border-gray-200 p-6">
          No pending payouts found.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Load #
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Shipper Paid
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Carrier Owed
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Carrier Name
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Invoice Total
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1A1D21]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.realmId}-${row.loadNumber}-${idx}`} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#1A1D21] text-sm">{row.loadNumber}</td>
                <td className="px-4 py-3 text-[#1A1D21] text-sm">{formatMoney(row.shipperPaid)}</td>
                <td className="px-4 py-3 text-[#1A1D21] text-sm">{formatMoney(row.carrierOwed)}</td>
                <td className="px-4 py-3 text-[#1A1D21] text-sm">{row.carrierName}</td>
                <td className="px-4 py-3 text-[#1A1D21] text-sm font-semibold">{row.finalTotal ? formatMoney(row.finalTotal) : "—"}</td>
                <td className="px-4 py-3">
                  <a
                    href={row.billId ? `https://app.meliopayments.com/pay/bills/${row.billId}` : "https://app.meliopayments.com/pay/bills"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    Review & Pay in Melio
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [hasData, loading, error, rows]);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-black uppercase tracking-[0.4em]">
            Pending Payouts
          </h2>
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#1A1D21]/60">
            From QuickBooks Invoice/Bill matches
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-gray-300 text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-black hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      {tableContent}
    </section>
  );
}
