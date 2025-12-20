"use client";

import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, Users, CheckCircle, Loader2 } from "lucide-react";

interface Load {
  id: string;
  commodity_type: string;
  load_weight: number;
  status: string;
}

interface Bid {
  id: string;
  load_id: string;
  carrier_id: string;
  bid_amount: number;
  status: string;
}

interface AILoadMatcherProps {
  loads: Load[];
  bids: Bid[];
}

interface AIRecommendation {
  loadId: string;
  recommendedCarrier: string;
  confidence: number;
  reasoning: string;
}

export default function AILoadMatcher({ loads, bids }: AILoadMatcherProps) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  const activeLoads = loads.filter((load) => load.status === "open");

  const getSmartRecommendation = async (loadId: string) => {
    setLoading(true);
    setSelectedLoadId(loadId);

    try {
      // Call Dify AI API
      const response = await fetch(`/api/dify/smart-match?loadId=${loadId}`);
      const data = await response.json();

      if (data.success) {
        setRecommendation(data.recommendation);
      } else {
        console.error("AI recommendation failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch AI recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-96 bg-charcoal-black text-white border-l border-white/10 flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-6 h-6 text-deep-forest-green" />
          <h3 className="text-xl font-sans font-bold uppercase tracking-tight">
            AI INSIGHTS
          </h3>
        </div>
        <p className="text-sm font-sans text-white/60">
          Smart matching powered by Dify Agentic AI
        </p>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* STATS */}
        <div className="mb-8">
          <h4 className="text-xs font-sans font-semibold uppercase tracking-wide text-white/50 mb-4">
            Platform Metrics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans text-white/70">Active Loads</span>
              <span className="text-lg font-sans font-bold text-deep-forest-green">
                {activeLoads.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans text-white/70">Total Bids</span>
              <span className="text-lg font-sans font-bold text-deep-forest-green">
                {bids.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans text-white/70">Avg. Bids/Load</span>
              <span className="text-lg font-sans font-bold text-deep-forest-green">
                {activeLoads.length > 0 ? (bids.length / activeLoads.length).toFixed(1) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* SMART MATCHING */}
        <div className="mb-8">
          <h4 className="text-xs font-sans font-semibold uppercase tracking-wide text-white/50 mb-4">
            Smart Matching
          </h4>

          {activeLoads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-white/30" />
              <p className="text-sm font-sans text-white/50">
                No active loads to analyze
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoads.slice(0, 3).map((load) => {
                const loadBids = bids.filter((bid) => bid.load_id === load.id);
                
                return (
                  <button
                    key={load.id}
                    onClick={() => getSmartRecommendation(load.id)}
                    disabled={loading && selectedLoadId === load.id}
                    className="w-full text-left bg-white/5 border border-white/10 rounded-none p-4 hover:border-deep-forest-green transition disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-sans text-sm font-semibold text-white">
                        {load.commodity_type || "Freight"}
                      </div>
                      {loadBids.length > 0 && (
                        <span className="text-xs font-sans text-deep-forest-green font-semibold">
                          {loadBids.length} bids
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-sans text-white/60">
                      {load.load_weight.toLocaleString()} lbs
                    </div>
                    {loading && selectedLoadId === load.id ? (
                      <div className="mt-3 flex items-center gap-2 text-xs text-deep-forest-green">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-deep-forest-green font-semibold">
                        GET RECOMMENDATION →
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RECOMMENDATION RESULT */}
        {recommendation && (
          <div className="border border-deep-forest-green/30 rounded-none p-4 bg-deep-forest-green/10">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-deep-forest-green" />
              <h4 className="text-sm font-sans font-bold uppercase text-white">
                Best Match Found
              </h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs font-sans text-white/50 uppercase mb-1">
                  Recommended Carrier
                </div>
                <div className="text-sm font-sans font-semibold text-white">
                  {recommendation.recommendedCarrier}
                </div>
              </div>

              <div>
                <div className="text-xs font-sans text-white/50 uppercase mb-1">
                  Confidence Score
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-none h-2">
                    <div
                      className="bg-deep-forest-green h-2 rounded-none transition-all duration-500"
                      style={{ width: `${recommendation.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-sans font-bold text-deep-forest-green">
                    {recommendation.confidence}%
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-sans text-white/50 uppercase mb-1">
                  AI Reasoning
                </div>
                <p className="text-xs font-sans text-white/80 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs font-sans text-white/40">
          <TrendingUp className="w-4 h-4" />
          <span>Powered by Dify AI Engine</span>
        </div>
      </div>
    </aside>
  );
}
