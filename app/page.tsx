// HITCHYARD - RULER ARCHETYPE LANDING PAGE
// Authoritative, Structured, Premium Load Matching Platform
// Light Theme - Abercrombie & Fitch Inspired Design

"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Shield, Truck } from "lucide-react";
import HitchyardCard from "./components/HitchyardCard";

export default function HomePage() {
  const router = useRouter();

  const handleCarrierApplication = () => {
    console.log("Redirecting to Carrier Application");
    router.push("/signup?role=carrier");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ASPIRATIONAL HERO SECTION - Full-width, minimal, clean */}
      <header 
        className="relative h-screen flex items-center justify-center bg-cover bg-center" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/video/hero-bg-placeholder.jpg)',
          backgroundColor: '#1A1D21' 
        }}
      >
        <div className="text-center relative z-10 px-6 max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-cinzel-bold text-white uppercase tracking-widest drop-shadow-lg mb-6">
            HITCHYARD.
          </h1>
          <p className="text-xl md:text-2xl text-white font-league-spartan drop-shadow-md mb-12 max-w-2xl mx-auto">
            The New Standard in Global Freight Authority.
          </p>
          <button
            onClick={handleCarrierApplication}
            className="px-10 py-4 bg-hitchyard-green text-white font-bold uppercase tracking-wider 
                       hover:bg-hitchyard-charcoal transition-colors duration-300 rounded-lg shadow-lg"
          >
            Explore Verified Lanes
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Light background with premium cards */}
      <main className="container mx-auto px-6 py-20">
        
        <h2 className="text-4xl md:text-5xl font-cinzel-bold text-center text-text-primary mb-16 uppercase tracking-widest">
          Curated Services
        </h2>

        {/* CARD GRID SECTION - Premium A&F style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          
          <HitchyardCard
            imageSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
            title="Verified Carrier Network"
            subtitle="Access pre-vetted, trusted carriers with verified insurance and compliance."
            href="/signup?role=carrier"
          />

          <HitchyardCard
            imageSrc="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800"
            title="Premium Load Matching"
            subtitle="AI-powered matching system connecting shippers with ideal carriers."
            href="/loads"
          />

          <HitchyardCard
            imageSrc="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800"
            title="Secure Transactions"
            subtitle="Enterprise-grade payment processing with transparent pricing."
            href="/dashboard"
          />
          
        </div>

        {/* FEATURES SECTION - Clean, minimal feature highlights */}
        <section className="py-16 bg-surface-secondary rounded-lg">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              
              {/* Feature 1 */}
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-6 text-hitchyard-green" />
                <h3 className="text-xl font-cinzel-bold uppercase mb-3 text-text-primary tracking-wider">
                  VERIFIED ACCESS
                </h3>
                <p className="font-league-spartan text-text-secondary leading-relaxed">
                  Every carrier is vetted with insurance verification and compliance checks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <Truck className="w-16 h-16 mx-auto mb-6 text-hitchyard-green" />
                <h3 className="text-xl font-cinzel-bold uppercase mb-3 text-text-primary tracking-wider">
                  LOAD MATCHING
                </h3>
                <p className="font-league-spartan text-text-secondary leading-relaxed">
                  Clean, fast load marketplace connecting shippers with trusted carriers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-hitchyard-green" />
                <h3 className="text-xl font-cinzel-bold uppercase mb-3 text-text-primary tracking-wider">
                  STRUCTURED CONTROL
                </h3>
                <p className="font-league-spartan text-text-secondary leading-relaxed">
                  Authoritative platform with strict vetting and transparent bidding.
                </p>
              </div>
              
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER - Minimal, clean */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-surface">
        <div className="max-w-7xl mx-auto text-center font-league-spartan text-sm text-text-secondary">
          <p>© 2025 HITCHYARD. The Standard in Enterprise Logistics.</p>
        </div>
      </footer>
    </div>
  );
}