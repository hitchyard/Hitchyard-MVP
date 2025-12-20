// HITCHYARD - IMPERIAL AUTHORITY DESIGN SYSTEM
// Imperial Pillars with negative-space scroll experience

"use client";

import { useRouter } from "next/navigation";

export default function HitchyardHome() {
  const router = useRouter();

  return (
    <div className="bg-[#1A1D21] text-white font-sans selection:bg-[#0B1F1A] overflow-x-hidden">
      {/* NAVIGATION - MINIMAL AUTHORITY */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-12 py-8 mix-blend-difference">
        <div className="text-xs font-serif tracking-[0.6em] uppercase">HITCHYARD</div>
        <div className="flex gap-10 font-sans text-[10px] uppercase tracking-[0.5em]">
          <button onClick={() => router.push('/register')} className="hover:opacity-70">APPLY</button>
          <button onClick={() => router.push('/loads')} className="hover:opacity-70">MARKET</button>
          <button onClick={() => router.push('/dashboard')} className="hover:opacity-70">PROTOCOL</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070')] bg-cover bg-center grayscale opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1A1D21] via-transparent to-[#1A1D21]" />

        <div className="relative z-10 max-w-5xl">
          <h1 className="font-serif font-black text-[15vw] leading-none tracking-[1em] uppercase mb-10">
            HITCHYARD
          </h1>
          <p className="font-sans text-[12px] tracking-[0.8em] uppercase text-white/80 mb-12">
            THE IMPERIAL STANDARD IN FREIGHT AUTHORITY
          </p>
        </div>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-white" aria-hidden="true" />

      {/* PILLAR I */}
      <section className="min-h-screen bg-white text-[#1A1D21] flex flex-col items-center justify-center px-8 text-center">
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[0.8em] uppercase">VETTING</h2>
        <p className="mt-20 font-sans text-[11px] tracking-[0.4em] uppercase max-w-2xl">
          The absolute exclusion of risk. Only 10% of carriers meet the Hitchyard Standard.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-[#1A1D21]" aria-hidden="true" />

      {/* PILLAR II */}
      <section className="min-h-screen bg-[#1A1D21] text-white flex flex-col items-center justify-center px-8 text-center">
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[0.8em] uppercase">PRECISION</h2>
        <p className="mt-20 font-sans text-[11px] tracking-[0.4em] uppercase max-w-2xl text-white/80">
          Market-locked rates. No negotiation. Total financial transparency.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-white" aria-hidden="true" />

      {/* PILLAR III */}
      <section className="min-h-screen bg-white text-[#1A1D21] flex flex-col items-center justify-center px-8 text-center">
        <h2 className="font-serif font-black text-[10vw] md:text-9xl leading-none tracking-[0.8em] uppercase">VELOCITY</h2>
        <p className="mt-20 font-sans text-[11px] tracking-[0.4em] uppercase max-w-2xl">
          Automated tender and settlement. Zero human friction.
        </p>
      </section>

      {/* NEGATIVE SPACE */}
      <section className="min-h-screen bg-[#1A1D21]" aria-hidden="true" />

      {/* GRIT CLUB GATEKEEPER */}
      <section className="min-h-screen bg-[#0B1F1A] flex items-center justify-center text-center px-8">
        <div className="max-w-3xl space-y-10">
          <h3 className="font-serif font-black text-6xl tracking-[0.6em] uppercase text-white">GRIT CLUB</h3>
          <p className="font-sans text-[11px] tracking-[0.4em] uppercase text-white/70">Imperial admission only.</p>
          <button
            onClick={() => router.push('/register')}
            className="mx-auto bg-white text-[#0B1F1A] px-16 py-5 font-sans font-semibold text-[11px] tracking-[0.5em] uppercase rounded-none"
          >
            APPLY FOR ACCESS
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

