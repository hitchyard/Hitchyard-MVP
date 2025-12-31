'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const lanes = [
  {
    id: 'HY-2146',
    route: 'Chicago → Dallas',
    rate: '$2,450',
    weight: '18,000 lbs',
    status: 'VERIFIED',
  },
  {
    id: 'HY-2147',
    route: 'Atlanta → Miami',
    rate: '$1,980',
    weight: '22,500 lbs',
    status: 'VERIFIED',
  },
  {
    id: 'HY-2148',
    route: 'Denver → Phoenix',
    rate: '$1,650',
    weight: '19,200 lbs',
    status: 'VERIFIED',
  },
];

const faqs = [
  {
    q: 'WHO IS ADMITTED?',
    a: 'Verified carriers with proof of authority, insurance, and payment history.',
  },
  {
    q: 'WHAT IS RECORDED?',
    a: 'Vetting, rate locks, tenders, payments, and performance are captured as system record.',
  },
  {
    q: 'HOW ARE RATES SET?',
    a: 'Rates are locked in the protocol and tied to the load record before movement.',
  },
  {
    q: 'WHERE IS SUPPORT?',
    a: 'Protocol guidance is available inside the system for verified members.',
  },
];

export default function CarrierRegistrationPage() {
  const [mcNumber, setMcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (!userId) {
        // Persist MC in query param and redirect to signup
        window.location.href = `/signup?page=carrier&mc=${encodeURIComponent(mcNumber)}`;
        return;
      }

      // Optionally store MC in registrations for the user
      await supabase
        .from('registrations')
        .upsert({ user_id: userId, mc_number: mcNumber }, { onConflict: 'user_id' });

      // Compliance check via FMCSA
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcNumber: mcNumber }),
      });
      const json = await res.json();

      if (json?.success && json?.data?.allowedToOperate === 'Y') {
        // Green Light → trigger contract signing
        window.location.href = '/onboarding/sign-contract';
        return;
      }
      // Otherwise, take user to carrier dashboard
      window.location.href = '/carrier-dashboard';
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="py-[200px] bg-charcoal text-white text-center px-6">
        <h1 className="font-cinzel font-bold text-[10vw] tracking-[0.7em] uppercase">HITCHYARD</h1>
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mt-8">Get Paid Net 0.</h2>
        <p className="font-spartan text-sm tracking-wide mt-4">Sign up in 60 seconds.</p>
        <div className="mt-10 max-w-md mx-auto flex gap-3">
          <input
            type="text"
            value={mcNumber}
            onChange={(e) => setMcNumber(e.target.value)}
            placeholder="MC NUMBER"
            className="w-full border-b border-white/30 bg-transparent text-sm font-spartan tracking-wide py-4 placeholder:text-white/50 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-charcoal px-6 py-4 uppercase font-spartan tracking-wide rounded-none"
          >
            {loading ? 'PROCESSING…' : 'START'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-300 font-spartan text-xs tracking-wide">{error}</p>
        )}
      </section>

      {/* Manifesto */}
      <section className="py-[200px] bg-white text-charcoal text-center px-6">
        <h2 className="font-cinzel font-bold text-5xl tracking-[0.6em] uppercase">
          FREIGHT UNDER AUTHORITY
        </h2>
        <p className="font-spartan text-sm tracking-wide mt-4 max-w-2xl mx-auto">
          Every load is confirmed before movement. Rates are fixed. Records are immutable. The system removes uncertainty so carriers operate with clarity and proof.
        </p>
      </section>

      {/* 6-Agent Workflow */}
      <section className="py-[200px] bg-charcoal text-white text-center px-6">
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mb-16">
          COMMAND STACK
        </h2>
        <div className="flex flex-col items-center space-y-14 max-w-2xl mx-auto">
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">VETTING PROTOCOL</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Identity, insurance, and credit verified before entry.</p>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">MATCHMAKING AGENT</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Assigns loads with documented fit and constraints.</p>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">RATE LOCKING</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Prices locked to the record before wheels move.</p>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">TENDER COMMAND</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Clear assignments issued, no ambiguity.</p>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">PAYMENT & SETTLEMENT</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Funds authorized, status posted to record.</p>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-2xl tracking-[0.6em] uppercase">PERFORMANCE RECORD</h3>
            <p className="font-spartan text-sm tracking-wide mt-2">Service, claims, and timeliness logged for trust.</p>
          </div>
        </div>
      </section>

      {/* Trust / Guarantee */}
      <section className="py-[200px] bg-white text-charcoal text-center px-6">
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mb-8">
          TRUST GUARANTEE
        </h2>
        <p className="font-spartan text-sm tracking-wide max-w-2xl mx-auto">
          Closed access. Verified participants. Every action leaves a record. Authority is enforced through protocol, not promises.
        </p>
        <div className="mt-12 flex flex-col items-center space-y-4">
          <span className="inline-block px-6 py-3 bg-forest text-white font-spartan text-[11px] tracking-[0.3em] uppercase rounded-none">
            ✓ VERIFIED ACCESS
          </span>
          <span className="inline-block px-6 py-3 bg-charcoal text-white font-spartan text-[11px] tracking-[0.3em] uppercase rounded-none border border-charcoal">
            RECORDED SETTLEMENTS
          </span>
        </div>
      </section>

      {/* Available Lanes */}
      <section className="py-[200px] bg-charcoal text-white text-center px-6">
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mb-16">
          AVAILABLE LANES
        </h2>
        <div className="flex flex-col items-center space-y-10 max-w-2xl mx-auto">
          {lanes.map((lane) => (
            <div
              key={lane.id}
              className="w-full border border-white/15 bg-charcoal text-left p-8 rounded-none"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel font-bold text-xl tracking-[0.5em] uppercase">{lane.route}</span>
                  <span className="px-4 py-2 bg-forest text-white text-[11px] font-spartan tracking-[0.3em] uppercase rounded-none">
                    {lane.status}
                  </span>
                </div>
                <p className="font-spartan text-sm tracking-wide text-white/80">{lane.weight}</p>
                <p className="font-spartan text-sm tracking-wide text-white/80">Rate: {lane.rate}</p>
                <p className="font-spartan text-xs tracking-wide text-white/60">Load ID: {lane.id}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration CTA */}
      <section className="py-[200px] bg-white text-charcoal text-center px-6">
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mb-12">QUALIFICATION & COMPLIANCE</h2>
        <div className="max-w-md mx-auto">
          <button onClick={() => (window.location.href = '/signup')} className="w-full mt-4 bg-charcoal text-white px-8 py-4 uppercase font-spartan tracking-wide rounded-none">
            CONTINUE TO SIGNUP
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[200px] bg-charcoal text-white text-center px-6">
        <h2 className="font-cinzel font-bold text-4xl tracking-[0.6em] uppercase mb-12">
          PROTOCOL FAQ
        </h2>
        <div className="flex flex-col items-center space-y-10 max-w-2xl mx-auto">
          {faqs.map((item) => (
            <div key={item.q} className="w-full text-left space-y-2">
              <h3 className="font-cinzel font-bold text-xl tracking-[0.5em] uppercase">{item.q}</h3>
              <p className="font-spartan text-sm tracking-wide text-white/80">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
