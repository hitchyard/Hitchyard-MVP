// HITCHYARD - IMPERIAL AUTHORITY DESIGN SYSTEM
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
      <section className="relative min-h-screen bg-white text-[#1A1D21] flex items-center justify-center px-8 text-center overflow-hidden">
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
      <section className="relative min-h-screen bg-white text-[#1A1D21] flex items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover grayscale blur-sm opacity-20" aria-hidden />
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[1.1em] uppercase">VELOCITY</h2>
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-[0.5em] uppercase max-w-[400px] text-center">
          Automated tender and settlement. Zero human friction.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-[#1A1D21]" aria-hidden="true" />

      {/* GRIT CLUB GATEKEEPER - SOVEREIGN TONE */}
      <section className="min-h-screen bg-[#0B1F1A] flex items-center justify-center text-center px-8">
        <div className="max-w-3xl space-y-10">
          <h3 className="font-serif font-black text-6xl tracking-[1.1em] uppercase text-white">ELITE CAPACITY. STRICTLY VETTED.</h3>
          <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-white/70">BY INVITATION ONLY.</p>
          <button
            onClick={() => router.push('/register')}
            className="mx-auto border border-white/30 text-white px-16 py-6 font-sans text-xs tracking-[0.6em] uppercase rounded-none hover:bg-white hover:text-black transition-all duration-700"
          >
            APPLY FOR ADMISSION
          </button>
        </div>
      </section>

      {/* ENDING NEGATIVE SPACE */}
      <footer className="min-h-screen bg-[#1A1D21] flex items-center justify-center text-center px-8">
        <div className="max-w-3xl">
          <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-white/60">
            HITCHYARD • THE IMPERIAL STANDARD
          </p>
        </div>
      </footer>
    </div>
  );
}

