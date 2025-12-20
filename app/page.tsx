// HITCHYARD - IMPERIAL AUTHORITY DESIGN SYSTEM
// Absolute Laws: py-[200px], rounded-none, tracking-[0.6em], single-column, center-aligned

"use client";

import { useRouter } from "next/navigation";
import Navigation from "./components/Navigation";
import Disclaimer from "./components/Disclaimer";

export default function HitchyardHome() {
  const router = useRouter();

  return (
    <div className="bg-[#1A1D21] text-white font-sans selection:bg-[#0B1F1A] overflow-x-hidden">
      {/* GHOST WATERMARK - Fixed, ultra-subtle */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-10 z-0 flex justify-center"
      >
        <div className="text-white/5 opacity-[0.03] font-serif uppercase tracking-[0.6em]"
             style={{ fontSize: '18vw', lineHeight: 1, height: '30vh' }}>
          HITCHYARD
        </div>
      </div>
      
      {/* TRANSPARENT NAVIGATION */}
      <Navigation />

      {/* 1. THE IMPERIAL HERO - LAW OF SPACE & CENTRALITY */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-6">
        {/* Cinematic Background - Subordinate industrial texture */}
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070')] bg-cover bg-center grayscale opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1A1D21] via-transparent to-[#1A1D21]" />

        <div className="relative z-10 max-w-4xl">
          <h1 className="font-serif text-[10vw] md:text-[8vw] leading-none tracking-[0.8em] uppercase mb-12 opacity-95">
            HITCHYARD
          </h1>
          <p className="font-sans text-[12px] tracking-[0.8em] uppercase text-white mb-16">
            The New Standard in Global Freight Authority
          </p>
          
          <div className="flex flex-col gap-6 items-center mt-12">
            <button 
              onClick={() => router.push('/register')}
              className="bg-white text-[#1A1D21] px-16 py-6 rounded-none text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#0B1F1A] hover:text-white transition-all duration-700"
            >
              APPLY FOR ACCESS
            </button>
            <button 
              onClick={() => router.push('/loads')}
              className="text-white border border-white/20 px-16 py-6 rounded-none text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-700"
            >
              VERIFIED PROTOCOL
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE 6-AGENT WORKFLOW - LAW OF SPACE: py-[200px] */}
      <section className="bg-white text-[#1A1D21] py-[200px] px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[9px] tracking-[0.6em] text-[#1A1D21] uppercase mb-8 block">THE PROTOCOL</span>
          <h2 className="font-serif text-6xl tracking-[0.8em] uppercase mb-16">
            SIX-AGENT WORKFLOW
          </h2>
          <p className="text-[13px] tracking-[0.25em] leading-loose text-[#1A1D21] uppercase mb-20">
            Automated Authority Enforcement Through Intelligent Systems
          </p>

          {/* Vertical Stack - Single Column, Center-Aligned, Binary Contrast */}
          <div>
            {/* Agent 1: Vetting */}
            <div className="border-t border-black/10 py-[200px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT I: VETTING
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                Insurance verification, federal authority validation, safety rating analysis, and credit assessment through Equifax integration.
              </p>
            </div>

            {/* Agent 2: Matchmaking */}
            <div className="border-t border-black/10 py-[200px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT II: MATCHMAKING
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                AI-powered carrier selection based on equipment type, lane history, performance metrics, and capacity availability.
              </p>
            </div>

            {/* Agent 3: Rate-Locking */}
            <div className="border-t border-black/10 py-[200px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT III: RATE-LOCKING
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                Market-rate analysis and structured pricing enforcement to prevent rate volatility and ensure financial transparency.
              </p>
            </div>

            {/* Agent 4: Tender */}
            <div className="border-t border-black/10 py-[200px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT IV: TENDER
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                Automated tender generation with contract terms, pickup/delivery protocols, and compliance requirements.
              </p>
            </div>

            {/* Agent 5: Invoicing */}
            <div className="border-t border-black/10 py-[200px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT V: INVOICING
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                Automated invoice generation upon delivery confirmation with structured payment terms and audit trails.
              </p>
            </div>

            {/* Agent 6: Exception */}
            <div className="border-t border-black/10 py-[200px] border-b">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[#0B1F1A] font-bold text-[10px] tracking-[0.5em] uppercase">
                  ✓ VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-3xl tracking-[0.8em] uppercase mb-6">
                AGENT VI: EXCEPTION
              </h3>
              <p className="text-[13px] tracking-[0.2em] leading-relaxed text-[#1A1D21] uppercase max-w-2xl mx-auto">
                Real-time monitoring and escalation protocol for delays, damages, or compliance violations with resolution tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE GATEKEEPER BANNER - LAW OF SPACE: py-[200px] */}
      <section className="bg-[#0B1F1A] py-[200px] px-12 text-center">
        <h3 className="font-serif text-white text-4xl tracking-[0.8em] uppercase mb-12">
          VERIFIED ACCESS REQUIRED
        </h3>
        <p className="text-[12px] tracking-[0.5em] uppercase text-white mb-16 max-w-2xl mx-auto">
          The Grit Club • Insurance Vetting • Federal Compliance
        </p>
        <button 
          onClick={() => router.push('/register')}
          className="bg-white text-[#0B1F1A] px-20 py-6 rounded-none text-[12px] font-black tracking-[0.5em] uppercase hover:bg-[#1A1D21] hover:text-white transition-all duration-700"
        >
          APPLY FOR MEMBERSHIP
        </button>
      </section>

      {/* 4. THE VETTING STANDARD - LAW OF SPACE: py-[200px] */}
      <section className="bg-[#1A1D21] py-[200px] px-12 text-center border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <span className="text-[9px] tracking-[0.6em] text-white uppercase mb-8 block">THE STANDARD</span>
          <h2 className="font-serif text-6xl tracking-[0.8em] uppercase mb-16 text-white">
            VETTING PROTOCOL
          </h2>
          <p className="text-[13px] tracking-[0.25em] leading-loose text-white uppercase mb-20">
            Insurance Verification • Federal Operating Authority • Safety Ratings • Financial Compliance
          </p>
          <p className="text-[12px] tracking-[0.2em] leading-relaxed text-white max-w-xl mx-auto">
            All carriers are independently reviewed and cross-referenced against federal and private databases. 
            Vetting is conducted by licensed officers with access to FMCSA, insurance, and safety records.
          </p>
        </div>
      </section>

      {/* 5. THE IMPERIAL FOOTER - LAW OF SPACE: py-[200px] */}
      <footer className="bg-[#1A1D21] py-[200px] border-t border-white/5 px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <p className="font-sans text-[9px] text-white tracking-[0.4em] uppercase mb-12 max-w-3xl leading-loose">
            Hitchyard is a licensed freight broker operating under FMCSA authority. 
            All carriers are independently vetted and verified for insurance compliance, 
            safety ratings, and federal operating authority.
          </p>
          
          <div className="w-full border-t border-white/10 pt-12 mt-12">
            <p className="text-white text-[9px] tracking-[0.5em] uppercase">
              © 2025 HITCHYARD. THE AUTHORITY STANDARD IN ENTERPRISE LOGISTICS.
            </p>
          </div>
        </div>
      </footer>

      {/* DISCLAIMER */}
      <Disclaimer />
    </div>
  );
}
