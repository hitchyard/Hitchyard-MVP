// HITCHYARD - RULER ARCHETYPE LANDING PAGE
// Authoritative, Structured, Premium Load Matching Platform

"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Shield, Truck } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleCarrierApplication = () => {
    console.log("Redirecting to Carrier Application");
    router.push("/signup?role=carrier");
  };

  return (
    <div className="bg-charcoal-black min-h-screen text-contrast-white">
      {/* NAVIGATION - Authority Top Bar */}
      <nav className="bg-charcoal-black border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-cinzel font-bold tracking-tight uppercase">
            HITCHYARD
          </h1>
          <div className="flex gap-6 font-spartan text-sm font-medium">
            <a href="#" className="hover:text-deep-forest-green transition">LOADS</a>
            <a href="#" className="hover:text-deep-forest-green transition">CARRIERS</a>
            <a href="#" className="hover:text-deep-forest-green transition">CONTACT</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Cinzel Bold Statement */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-cinzel font-extrabold uppercase tracking-tight mb-6">
            THE SYSTEM OF RECORD
          </h2>
          <p className="text-xl font-spartan text-white/80 max-w-2xl mx-auto mb-12">
            Hitchyard is the definitive operating system for enterprise logistics. 
            Verified carriers. Vetted shippers. Zero chaos.
          </p>
          
          {/* Primary CTA */}
          <button
            onClick={handleCarrierApplication}
            className="bg-deep-forest-green text-white font-spartan font-semibold text-lg px-8 py-4 hover:bg-green-800 transition shadow-lg uppercase tracking-wide"
          >
            APPLY AS VERIFIED CARRIER
          </button>
        </div>
      </section>

      {/* FEATURES - Structured Grid with Icons */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-deep-forest-green stroke-1" />
              <h3 className="text-xl font-cinzel font-bold uppercase mb-3">
                VERIFIED ACCESS
              </h3>
              <p className="font-spartan text-white/70">
                Every carrier is vetted with insurance verification and compliance checks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8">
              <Truck className="w-12 h-12 mx-auto mb-4 text-deep-forest-green stroke-1" />
              <h3 className="text-xl font-cinzel font-bold uppercase mb-3">
                LOAD MATCHING
              </h3>
              <p className="font-spartan text-white/70">
                Clean, fast load marketplace connecting shippers with trusted carriers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-deep-forest-green stroke-1" />
              <h3 className="text-xl font-cinzel font-bold uppercase mb-3">
                STRUCTURED CONTROL
              </h3>
              <p className="font-spartan text-white/70">
                Authoritative platform with strict vetting and transparent bidding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto text-center font-spartan text-sm text-white/50">
          <p>© 2025 HITCHYARD. The Standard in Enterprise Logistics.</p>
        </div>
      </footer>
    </div>
  );
}