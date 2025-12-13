'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, X } from 'lucide-react';

const DEEP_FOREST_GREEN = '#0B1F1A';

export default function LoadsDispatchModule({ loadsData = [] }) {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        // If loadsData is passed as a prop, use it; otherwise fetch from Airtable
        if (loadsData && loadsData.length > 0) {
          setLoads(loadsData);
          setLoading(false);
          return;
        }

        const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
        const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'app4qYpj81N8RlSaa';
        const tableId = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID || 'tblNaiawVnrlcgTR9';

        const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch loads from Airtable');
        }

        const data = await response.json();

        // Extract top 3-5 records and map to our display format
        const loadsList = (data.records || []).slice(0, 5).map((record) => ({
          id: record.id,
          companyName: record.fields['Company Name'] || 'N/A',
          submissionDate: record.fields['Submission Date'] || 'N/A',
          rate: record.fields['Rate'] || '$0',
        }));

        setLoads(loadsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching loads:', err);
        setError('Error: Data Synchronization Failed');
        setLoads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, [loadsData]);

  // BID MODAL COMPONENT
  const BidModal = () => {
    if (!selectedLoad) return null;

    const handleSubmitBid = () => {
      console.log(`Bid placed for Load #${selectedLoad.id}: $${bidAmount}`);
      setIsModalOpen(false);
      setBidAmount('');
      setSelectedLoad(null);
    };

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-cinzel text-2xl font-bold" style={{ color: DEEP_FOREST_GREEN }}>
              PLACE BID
            </h3>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setBidAmount('');
                setSelectedLoad(null);
              }}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X size={24} />
            </button>
          </div>

          <p className="font-spartan text-gray-700 mb-6">
            Submitting bid for <strong>Load #{selectedLoad.id}</strong>
          </p>

          <div className="mb-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 font-spartan mb-2">Company:</p>
            <p className="font-spartan font-semibold text-gray-900">{selectedLoad.companyName}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 font-spartan mb-2">
              Your Rate ($)
            </label>
            <input
              type="number"
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 font-spartan"
            />
          </div>

          <button
            onClick={handleSubmitBid}
            disabled={!bidAmount}
            className="w-full py-3 text-white font-bold rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-cinzel"
            style={{ backgroundColor: DEEP_FOREST_GREEN }}
          >
            SUBMIT BID
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-[#0B1F1A] border border-[#1A1D21] rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin mb-4">
          <TrendingUp className="w-8 h-8 text-[#0B1F1A]" stroke="#FFFFFF" />
        </div>
        <p className="text-[#E0E0E0] font-spartan text-lg font-semibold">Loading Loads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#1A1A1A] border border-red-900 rounded-lg p-8 flex flex-col items-center justify-center">
        <p className="text-red-300 font-spartan text-lg font-semibold">{error}</p>
        <p className="text-[#666666] font-spartan text-sm mt-2">Unable to connect to Airtable. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F1A] px-6 py-4 border-b border-[#333333]">
          <h2 className="text-[#FFFFFF] font-cinzel text-xl font-bold">Active Dispatch Queue</h2>
          <p className="text-[#E0E0E0] font-spartan text-sm mt-1">
            {loads.length} load{loads.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Loads List */}
        <div className="divide-y divide-[#333333]">
          {loads.length > 0 ? (
            loads.map((load) => (
              <div
                key={load.id}
                className="px-6 py-4 hover:bg-[#252525] transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-[#FFFFFF] font-spartan font-semibold text-base">
                      {load.companyName}
                    </h3>
                    <p className="text-[#666666] font-spartan text-sm mt-1">
                      Submitted: {load.submissionDate}
                    </p>
                    {load.rate && (
                      <p className="text-[#0B1F1A] font-cinzel text-sm font-bold mt-2">
                        Asking Rate: {load.rate}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className="inline-block px-3 py-1 bg-[#0B1F1A] text-[#FFFFFF] font-spartan text-xs font-semibold rounded">
                      Available
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLoad(load);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 text-white font-bold rounded transition duration-150 font-cinzel text-sm"
                      style={{ backgroundColor: DEEP_FOREST_GREEN }}
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[#666666] font-spartan text-sm">No loads available at this time</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <BidModal />}
    </div>
  );
}
