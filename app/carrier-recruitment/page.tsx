"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Disclaimer from "../components/Disclaimer";
import Navigation from "../components/Navigation";

// Carrier Recruitment Landing + Application
export default function CarrierRecruitment() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    zipCode: "",
    mcNumber: "",
    dotNumber: "",
    cargoPolicyNumber: "",
    autoLiabilityPolicyNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          userType: "Carrier",
          complianceDate: undefined,
          companyName: form.companyName,
          zipCode: form.zipCode,
          mcNumber: form.mcNumber,
          dotNumber: form.dotNumber,
          cargoPolicyNumber: form.cargoPolicyNumber,
          autoLiabilityPolicyNumber: form.autoLiabilityPolicyNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.details || "Registration failed");
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1D21] text-white selection:bg-[#0B1F1A]">
      <Navigation />

      {/* SECTION 1: THE IMPERIAL HERO */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center px-6 border-b border-white/10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Background image optional: place file at public/logistics-night-symmetrical.jpg */}
          <div className="absolute inset-0 bg-[#1A1D21]/80 z-10" />
          <img
            src="/logistics-night-symmetrical.jpg"
            alt="Infrastructure"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="relative z-20 text-center">
          <h1 className="font-cinzel text-5xl md:text-8xl font-bold tracking-[0.8em] mb-8">
            HITCHYARD
          </h1>
          <p className="font-spartan text-xs md:text-sm tracking-[0.4em] uppercase text-white/60">
            The New Standard in Global Freight Authority
          </p>
        </div>
      </section>

      {/* SECTION 2: THE HOOK (WHITE BLOCK) */}
      <section className="bg-white text-[#1A1D21] py-[200px] px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold tracking-[0.6em] mb-12 uppercase">
            Not for everyone.
          </h2>
          <p className="font-spartan text-sm leading-relaxed tracking-widest max-w-xl mx-auto">
            Hitchyard is an invite-only network. We do not aggregate loads; we orchestrate certainty.
            Only carriers who pass the Vetting Protocol are granted access to the Command Center.
          </p>
        </div>
      </section>

      {/* SECTION 3: APPLICATION FORM (CHARCOAL BLOCK) */}
      {!submitted ? (
        <section className="bg-[#1A1D21] py-[200px] px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-cinzel text-2xl font-bold tracking-[0.5em] uppercase mb-4">
                Apply for Access
              </h2>
              <div className="h-px w-20 bg-[#0B1F1A] mx-auto" />
            </div>

            <form onSubmit={onSubmit} className="space-y-12">
              <div className="space-y-8">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="COMPANY EMAIL"
                  value={form.email}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="CREATE PASSPHRASE"
                  value={form.password}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="companyName"
                  required
                  placeholder="COMPANY NAME"
                  value={form.companyName}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="zipCode"
                  required
                  placeholder="ZIP CODE"
                  value={form.zipCode}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="mcNumber"
                  required
                  placeholder="MC NUMBER"
                  value={form.mcNumber}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="dotNumber"
                  placeholder="DOT NUMBER (OPTIONAL)"
                  value={form.dotNumber}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="cargoPolicyNumber"
                  required
                  placeholder="CARGO POLICY NUMBER"
                  value={form.cargoPolicyNumber}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
                <input
                  name="autoLiabilityPolicyNumber"
                  required
                  placeholder="AUTO LIABILITY POLICY NUMBER"
                  value={form.autoLiabilityPolicyNumber}
                  onChange={onChange}
                  className="w-full border-b border-white/20 bg-transparent text-white text-sm font-spartan py-4 placeholder:text-white/60 focus:border-white outline-none"
                />
              </div>

              {error && (
                <div className="text-center text-[11px] uppercase tracking-[0.3em] text-red-400">{error}</div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-12 py-5 bg-[#0B1F1A] text-white font-cinzel font-bold text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all duration-700 disabled:opacity-40"
                >
                  {submitting ? "PROCESSING…" : "SUBMIT CREDENTIALS"}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <section className="bg-[#1A1D21] py-[200px] px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold tracking-[0.6em] mb-8 uppercase">
              CREDENTIALS SUBMITTED
            </h2>
            <p className="font-spartan text-sm tracking-widest text-white/70">
              The Vetting Protocol has begun. You will receive instructions to access the Command Center.
            </p>
          </div>
        </section>
      )}

      <Disclaimer />
    </main>
  );
}
