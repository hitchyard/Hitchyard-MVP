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

        export default function SovereignFunnel() {
          return (
            <main className="bg-white text-[#1A1D21] font-sans selection:bg-[#0B1F1A] selection:text-white">
              {/* Sovereign Navigation */}
              <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md px-12 py-6 flex justify-between items-center text-[11px] tracking-[0.5em] uppercase font-bold border-b border-gray-100">
                <span>HITCHYARD</span>
                <div className="hidden md:flex space-x-12">
                  <a href="#problem" className="hover:opacity-50 transition">The Problem</a>
                  <a href="#solution" className="hover:opacity-50 transition">The Protocol</a>
                  <a href="/register" className="text-[#0B1F1A] font-black underline underline-offset-8">Apply Now</a>
                </div>
              </nav>

              {/* HERO: The Emotional Hook */}
              <section className="relative h-screen flex flex-col items-center justify-center pt-20 px-6">
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1519003300449-424ad0ee0456?q=80&w=2500&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale opacity-20" 
                    alt="Industry Reality"
                  />
                </div>
                <div className="relative z-10 text-center max-w-5xl">
                  <h1 className="text-[10vw] md:text-[8vw] leading-none font-black tracking-tighter uppercase mb-8">
                    RECLAIM <br/>CERTAINTY.
                  </h1>
                  <p className="text-[16px] md:text-[20px] tracking-[0.2em] font-light uppercase max-w-2xl mx-auto leading-relaxed">
                    The industry is in chaos. Rates are volatile. Trust is gone. We built the Sovereign Protocol to fix it.
                  </p>
                  <div className="mt-12 flex justify-center">
                     <div className="h-[100px] w-[1px] bg-[#1A1D21]/20"></div>
                  </div>
                </div>
              </section>

              {/* THE PROBLEM: ClickFunnels Psychology */}
              <section id="problem" className="py-40 bg-white px-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8">
                    <h2 className="text-6xl font-black uppercase tracking-tighter">The Broker <br/>Failure.</h2>
                    <p className="text-lg opacity-80 leading-relaxed">
                      Standard brokers profit from your desperation. They hide margins, slow-walk payments, and gamble with your cargo. In a recession, you can't afford "standard."
                    </p>
                  </div>
                  <div className="aspect-video bg-[#1A1D21] flex items-center justify-center text-white p-12 text-center border-8 border-gray-50">
                     <p className="text-xs tracking-[0.5em] uppercase opacity-50">[ PLACEHOLDER: THE MECHANISM VIDEO ]</p>
                  </div>
                </div>
              </section>

              {/* THE SOLUTION: The 3 Pillars of Authority */}
              <section id="solution" className="py-40 bg-[#1A1D21] text-white">
                <div className="max-w-7xl mx-auto px-10">
                  <div className="grid md:grid-cols-3 gap-16 text-center">
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase tracking-widest">Vetting</h3>
                      <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">We filter the noise. Only the top 10% of carriers move Sovereign freight.</p>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase tracking-widest">Precision</h3>
                      <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">Market-locked rates. No haggling. No surprises. Financial law.</p>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase tracking-widest">Velocity</h3>
                      <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">Automated settlement. QuickPay is not an option; it is the standard.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* THE CTA: The Grit Club Funnel */}
              <section className="py-60 bg-white text-center px-10">
                <h2 className="text-[6vw] font-black tracking-tighter uppercase mb-12">Join the Elite.</h2>
                <p className="text-[12px] tracking-[0.6em] mb-20 opacity-50 uppercase">BY INVITATION ONLY</p>
                <a 
                  href="/register" 
                  className="inline-block px-24 py-8 bg-[#0B1F1A] text-white text-[11px] tracking-[1em] font-bold uppercase hover:bg-[#1A1D21] transition-all duration-500"
                >
                  Apply for Admission
                </a>
              </section>

              <footer className="py-20 border-t border-gray-100 text-center opacity-40 text-[9px] tracking-[0.4em] uppercase">
                HITCHYARD • THE SOVEREIGN PROTOCOL • SALT LAKE CITY, UT
              </footer>
            </main>
          );
        }

