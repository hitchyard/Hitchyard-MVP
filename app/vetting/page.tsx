"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitVettingAction } from "./actions";

export default function VettingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [dotNumber, setDotNumber] = useState("");
  const [legalEntity, setLegalEntity] = useState("LLC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await submitVettingAction({
        company_name: companyName,
        dot_number: dotNumber,
        legal_entity_type: legalEntity,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSuccess("Vetting request submitted. We will notify you by email when vetting is complete.");

      // Optionally redirect after brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2200);
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-spartan font-semibold text-white mb-2">Start Shipper Vetting</h1>
        <p className="text-gray-400 mb-6">Provide the details below to begin the verification process. A structured review will follow and you will be notified of the outcome.</p>

        <div className="bg-white rounded-lg shadow p-8">
          {success ? (
            <div className="text-center">
              <svg className="w-12 h-12 text-deep-green mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-charcoal-black">Submission Received</h2>
              <p className="text-gray-600 mt-2">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-charcoal-black mb-1">Company Name</label>
                <input
                  id="company_name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
                  placeholder="Full legal company name"
                />
              </div>

              <div>
                <label htmlFor="dot_number" className="block text-sm font-medium text-charcoal-black mb-1">DOT Number</label>
                <input
                  id="dot_number"
                  type="text"
                  required
                  value={dotNumber}
                  onChange={(e) => setDotNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
                  placeholder="Department of Transportation number"
                />
              </div>

              <div>
                <label htmlFor="legal_entity" className="block text-sm font-medium text-charcoal-black mb-1">Legal Entity Type</label>
                <select
                  id="legal_entity"
                  value={legalEntity}
                  onChange={(e) => setLegalEntity(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-deep-green"
                >
                  <option>LLC</option>
                  <option>Corporation</option>
                  <option>Partnership</option>
                  <option>Sole Proprietorship</option>
                </select>
              </div>

              {error && <div role="alert" className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-deep-green text-white rounded-md disabled:opacity-60 hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black font-semibold"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Vetting"
                  )}
                </button>

                <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-200 text-charcoal-black rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-charcoal-black font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
