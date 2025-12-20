import React from 'react';

export default function SovereignGallery() {
  return (
    <main className="bg-white text-[#1A1D21] font-sans selection:bg-[#0B1F1A] selection:text-white">
      {/* Sovereign Fixed Navigation */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-12 py-10 flex justify-between items-center text-[11px] tracking-[0.5em] uppercase font-bold">
        <span>HITCHYARD</span>
        <div className="hidden md:flex space-x-12">
          <a href="#protocol" className="hover:opacity-50 transition">The Protocol</a>
          <a href="#grit-club" className="hover:opacity-50 transition">Admission</a>
          <a href="/login" className="hover:opacity-50 transition">Sign In</a>
        </div>
      </nav>

      {/* HERO: The Abercrombie Visual Statement */}
      <section className="relative h-[110vh] flex items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 z-0 px-10 py-20">
          <img 
            src="https://images.unsplash.com/photo-1586191582151-f726350d31f3?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale brightness-90 shadow-2xl" 
            alt="Industrial Symmetry"
          />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-[12vw] leading-none font-black tracking-[-0.02em] uppercase mb-4 drop-shadow-xl">
            HITCHYARD
          </h1>
          <p className="text-[14px] tracking-[0.8em] font-light uppercase">
            The Sovereign Standard
          </p>
        </div>
      </section>

      {/* PILLAR I: VETTING (White Background / Bold Typography) */}
      <section id="protocol" className="py-[250px] bg-white text-center px-10">
        <h2 className="text-[8vw] font-black tracking-tight leading-none uppercase mb-12">
          VETTING
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-[12px] leading-loose tracking-[0.4em] uppercase opacity-60">
            The absolute exclusion of risk. We reject 90% of carriers to ensure the remaining 10% represent the elite standard of the Salt Lake market.
          </p>
        </div>
      </section>

      {/* VISUAL BREAK: Industrial Texture */}
      <section className="h-[80vh] bg-[#1A1D21] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1519003300449-424ad0ee0456?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40 grayscale"
          alt="Fleet Authority"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[1px] w-[300px] bg-white/30" />
        </div>
      </section>

      {/* PILLAR II: PRECISION */}
      <section className="py-[250px] bg-white text-center px-10">
        <h2 className="text-[8vw] font-black tracking-tight leading-none uppercase mb-12 text-[#1A1D21]">
          PRECISION
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-[12px] leading-loose tracking-[0.4em] uppercase opacity-60">
            Market-locked rates. No negotiation. No volatility. Our proprietary engine provides financial certainty in an unpredictable industry.
          </p>
        </div>
      </section>

      {/* THE GRIT CLUB: The Sovereign Call to Action */}
      <section id="grit-club" className="relative py-[200px] bg-[#0B1F1A] text-white flex flex-col items-center">
        <div className="text-center mb-20">
          <h3 className="text-[6vw] font-black tracking-tighter uppercase mb-4">THE GRIT CLUB</h3>
          <p className="text-[11px] tracking-[0.6em] opacity-50">BY INVITATION ONLY</p>
        </div>
        
        <a 
          href="/apply" 
          className="group relative px-24 py-8 border border-white/20 hover:border-white transition-all duration-700 bg-transparent overflow-hidden"
        >
          <span className="relative z-10 text-[10px] tracking-[1em] font-bold uppercase group-hover:text-[#0B1F1A] transition-colors duration-500">
            Apply For Admission
          </span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-40 border-t border-gray-100 text-center">
        <p className="text-[10vw] font-black text-gray-100 mb-10 leading-none select-none">HITCHYARD</p>
        <div className="text-[9px] tracking-[0.4em] opacity-40 uppercase">
          Licensed Freight Broker • Salt Lake City • Sovereign Protocol
        </div>
      </footer>
    </main>
  );
}// HITCHYARD - IMPERIAL AUTHORITY DESIGN SYSTEM
// Imperial Pillars with negative-space scroll experience

"use client";

import { useRouter } from "next/navigation";

export default function HitchyardHome() {
  const router = useRouter();

  return (
    <div className="bg-[#1A1D21] text-white font-sans selection:bg-[#0B1F1A] overflow-x-hidden relative">
      {/* GLOBAL LUXURY NOISE OVERLAY */}
      <div className="luxury-noise" aria-hidden />

      {/* NAVIGATION - MINIMAL AUTHORITY */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-12 py-8 mix-blend-difference">
        <div className="text-xs font-serif tracking-[0.6em] uppercase">HITCHYARD</div>
        <div className="flex gap-10 font-sans text-[10px] uppercase tracking-[0.6em]">
          <button onClick={() => router.push('/register')} className="hover:opacity-70">APPLY</button>
          <button onClick={() => router.push('/dashboard')} className="hover:opacity-70">THE PROTOCOL</button>
          <button onClick={() => router.push('/login')} className="hover:opacity-70">SIGN IN</button>
        </div>
      </nav>

      {/* HERO */}
        <section className="relative min-h-screen w-full flex items-center justify-center text-center px-6">
          <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1503392968121-9f3cfd85b7c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-[0.3] opacity-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1A1D21] via-transparent to-[#1A1D21]" />

          <h1 className="relative z-10 font-serif font-black text-[15vw] leading-none tracking-[1.2em] uppercase drop-shadow-2xl">
            HITCHYARD
          </h1>
        </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-white" aria-hidden="true" />

      {/* PILLAR I */}
      <section className="relative min-h-screen bg-[#1A1D21] text-white flex items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover grayscale opacity-20" aria-hidden />
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[1.1em] uppercase">VETTING</h2>
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-[0.5em] uppercase max-w-[400px] text-center">
          The absolute exclusion of risk. Only 10% of carriers meet the Hitchyard Standard.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-[#1A1D21]" aria-hidden="true" />

      {/* PILLAR II */}
      <section className="relative min-h-screen bg-[#1A1D21] text-white flex items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover grayscale opacity-20" aria-hidden />
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[1.1em] uppercase">PRECISION</h2>
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-[0.5em] uppercase max-w-[400px] text-center text-white/80">
          Market-locked rates. No negotiation. Total financial transparency.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-white" aria-hidden="true" />

      {/* PILLAR III */}
      <section className="relative min-h-screen bg-[#1A1D21] text-white flex items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover grayscale blur-sm opacity-20" aria-hidden />
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[1.1em] uppercase">VELOCITY</h2>
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-[0.5em] uppercase max-w-[400px] text-center">
          Automated tender and settlement. Zero human friction.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-[#1A1D21]" aria-hidden="true" />

      {/* GRIT CLUB GATEKEEPER - SOVEREIGN TONE */}
      <section className="min-h-screen bg-[#0B1F1A] text-white flex items-center justify-center text-center px-8">
        import React from 'react';

        export default function AbercrombieGallery() {
          return (
            <main className="bg-white text-[#1A1D21] font-sans selection:bg-[#0B1F1A] selection:text-white">
              {/* Sovereign Navigation: Minimal & Wide */}
              <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-12 py-6 flex justify-between items-center text-[11px] tracking-[0.5em] uppercase font-bold">
                <span>HITCHYARD</span>
                <div className="hidden md:flex space-x-12">
                  <a href="#protocol" className="hover:opacity-50 transition">The Protocol</a>
                  <a href="/register" className="hover:opacity-50 transition font-black text-[#0B1F1A]">Apply</a>
                  <a href="/login" className="hover:opacity-50 transition">Sign In</a>
                </div>
              </nav>

              {/* HERO: The Big Visual Statement */}
              <section className="relative h-screen flex items-center justify-center pt-20">
                <div className="absolute inset-0 z-0 p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1519003300449-424ad0ee0456?q=80&w=2500&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale brightness-110" 
                    alt="Elite Logistics"
                  />
                  {/* Subtle White Gradient Overlay */}
                  <div className="absolute inset-0 bg-white/20" />
                </div>
                <div className="relative z-10 text-center">
                  <h1 className="text-[14vw] leading-none font-black tracking-[-0.05em] uppercase text-[#1A1D21]">
                    HITCHYARD
                  </h1>
                  <p className="text-[13px] tracking-[0.8em] font-bold uppercase mt-4">
                    The Sovereign Standard in Freight
                  </p>
                </div>
              </section>

              {/* PILLAR I: VETTING (The Art Gallery Space) */}
              <section id="protocol" className="py-[300px] bg-white text-center px-10 border-b border-gray-100">
                <h2 className="text-[10vw] font-black tracking-tighter leading-none uppercase mb-16">
                  VETTING
                </h2>
                <div className="max-w-xl mx-auto">
                  <p className="text-[14px] leading-loose tracking-[0.3em] uppercase opacity-70">
                    We reject 90% of applicants. The Grit Club represents the absolute exclusion of risk for the Salt Lake market.
                  </p>
                </div>
              </section>

              {/* FULL WIDTH IMAGE BREAK (Like a Catalog Spread) */}
              <section className="h-[90vh] w-full relative">
                <img 
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2500&auto=format&fit=crop" 
                  className="w-full h-full object-cover grayscale"
                  alt="The Machine"
                />
              </section>

              {/* PILLAR II: PRECISION */}
              <section className="py-[300px] bg-white text-center px-10">
                <h2 className="text-[10vw] font-black tracking-tighter leading-none uppercase mb-16">
                  PRECISION
                </h2>
                <div className="max-w-xl mx-auto">
                  <p className="text-[14px] leading-loose tracking-[0.3em] uppercase opacity-70">
                    Market-locked rates. Total financial transparency. A sovereign engine designed for enterprise predictability.
                  </p>
                </div>
              </section>

              {/* THE GRIT CLUB: The Only Green Section (Exclusivity) */}
              <section className="py-[250px] bg-[#0B1F1A] text-white text-center">
                <h3 className="text-[7vw] font-black tracking-tighter uppercase mb-6">THE GRIT CLUB</h3>
                <p className="text-[12px] tracking-[0.6em] mb-20 opacity-50 uppercase">By Invitation Only</p>
        
                <a 
                  href="/register" 
                  className="inline-block px-24 py-8 border-2 border-white text-[11px] tracking-[1em] font-bold uppercase hover:bg-white hover:text-[#0B1F1A] transition-all duration-500"
                >
                  Apply For Admission
                </a>
              </section>

              {/* FOOTER: Minimalist Disclaimer */}
              <footer className="bg-white py-40 text-center">
                <div className="text-[10px] tracking-[0.5em] opacity-30 uppercase">
                  HITCHYARD LLC • Licensed Freight Broker • Sovereign Protocol 01
                </div>
              </footer>
            </main>
          );
        }

