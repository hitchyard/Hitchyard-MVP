"use client";
import React from "react";

export default function SovereignFunnel() {
  return (
    <main className="bg-white text-[#1A1D21] font-sans selection:bg-[#0B1F1A] selection:text-white">
      {/* LUXURY NOISE OVERLAY */}
      <div className="luxury-noise" aria-hidden />
      {/* Sovereign Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md px-12 py-6 flex justify-between items-center text-[11px] tracking-[0.5em] uppercase font-bold border-b border-gray-100">
        <span>HITCHYARD</span>
        <div className="hidden md:flex space-x-12">
          <a href="#problem" className="hover:opacity-50 transition">
            The Problem
          </a>
          <a href="#solution" className="hover:opacity-50 transition">
            The Protocol
          </a>
          <a
            href="/register"
            className="text-[#0B1F1A] font-black underline underline-offset-8"
          >
            Apply Now
          </a>
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
            THE STANDARD OF ABSOLUTE CERTAINTY.
          </h1>
          <p className="text-[16px] md:text-[20px] tracking-[0.2em] font-light uppercase max-w-2xl mx-auto leading-relaxed">
            In a marketplace of noise, silence is ultimate leverage.
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
            <h2 className="text-6xl font-black uppercase tracking-tighter">
              Market <br />
              Disorder.
            </h2>
            <p className="text-lg opacity-80 leading-relaxed">
              Fragmented infrastructure. Mediocrity entrenched. Chaos distorts rates.
              Opaque settlement erodes planning.
            </p>
          </div>
          <div className="aspect-video bg-[#1A1D21] flex items-center justify-center text-white p-12 text-center border-8 border-gray-50">
            <p className="text-xs tracking-[0.5em] uppercase opacity-50">
              [ PLACEHOLDER: THE MECHANISM VIDEO ]
            </p>
          </div>
        </div>
      </section>

      {/* THE SOLUTION: The 3 Pillars of Authority */}
      <section id="solution" className="py-40 bg-[#1A1D21] text-white">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-black uppercase tracking-[0.4em]">THE SOVEREIGN PROTOCOL</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-widest">Architectural Clarity</h3>
              <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">Governance of capacity. The lower ninety is excluded. Legacy reliability.</p>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-widest">Protocol Governance</h3>
              <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">Market-locked rates. Transparent settlement. Empire-grade predictability.</p>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-widest">Legacy Infrastructure</h3>
              <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">Disciplined settlement. Cash on schedule. Systems that endure.</p>
            </div>
          </div>
        </div>
      </section>
          <a
            href="/register"
            className="text-[#0B1F1A] font-black underline underline-offset-8"
          >
            Request a Briefing
          </a>
        <p className="text-[12px] tracking-[0.6em] mb-20 opacity-50 uppercase">
          BY INVITATION ONLY
        </p>
        <a
          href="/register"
          className="inline-block px-24 py-8 bg-[#0B1F1A] text-white text-[11px] tracking-[1em] font-bold uppercase hover:bg-[#1A1D21] transition-all duration-500"
        >
          Request a Briefing
        </a>
      </section>

      <footer className="py-20 border-t border-gray-100 text-center opacity-40 text-[9px] tracking-[0.4em] uppercase">
        HITCHYARD • THE SOVEREIGN PROTOCOL • SALT LAKE CITY, UT
      </footer>
    </main>
  );
}
