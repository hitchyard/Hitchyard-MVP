import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-charcoal-black flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        
        {/* Header and Branding */}
        'use client';

        import React, { useState } from 'react';

        // Use brand colors defined in globals.css via Tailwind arbitrary values
        const CHARCOAL = 'var(--brand-charcoal)';
        const GREEN = 'var(--brand-deep-forest)';

        export default function PrelaunchWaitlist() {
          const [isSubmitted, setIsSubmitted] = useState(false);

          // This function would be replaced with your actual API call to save the lead
          const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            // Simulate API submission delay
            setTimeout(() => {
              setIsSubmitted(true);
              // In a real app, you would send the data to your CRM/DB here
              console.log('Lead submitted and qualified!');
            }, 1000);
          };

          if (isSubmitted) {
            return (
              <main className="w-full max-w-2xl text-center p-10 mt-20">
                <h1 
                  className="text-4xl sm:text-5xl tracking-tighter font-extrabold mb-4" 
                  style={{ fontFamily: 'Cinzel Bold, serif', color: CHARCOAL }}
                >
                  Your Access Position is Secured.
                </h1>
                <p className="text-lg text-gray-700 max-w-md mx-auto mb-10">
                  The moment our full broker authority is activated, you will be the first to be onboarded.
                  You have secured your place in the new standard.
                </p>
                <div className="text-sm text-gray-500 mt-12">
                  Compliance Verified. Ready for Q4 2025.
                </div>
              </main>
            );
          }

          return (
            <main className="w-full max-w-4xl text-center p-8 mt-20">
              <h1 
                className="text-5xl sm:text-7xl tracking-tighter font-extrabold mb-6" 
                style={{ fontFamily: 'Cinzel Bold, serif', color: CHARCOAL }}
              >
                The Standard Has Arrived.
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-12 font-light">
                Hitchyard is the new operating system for enterprise logistics. Secure verified access now and be ready to transact the moment our broker authority is activated.
              </p>

              {/* Qualification Form (Structured and Geometric) */}
              <div className="card max-w-md mx-auto p-8 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 transition duration-150 text-base text-gray-800"
                  />
                  <input
                    type="email"
                    placeholder="Official Company Email"
                    required
                    className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 transition duration-150 text-base text-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    required
                    className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 transition duration-150 text-base text-gray-800"
                  />
                  <button
                    type="submit"
                    className="p-3 mt-4 text-white font-semibold rounded-md transition duration-200 hover:opacity-90 shadow-lg"
                    style={{ backgroundColor: GREEN }}
                  >
                    SECURE VERIFIED ACCESS
                  </button>
                </form>
              </div>

              <div className="text-sm text-gray-500 mt-12">
                <p>This is a B2B platform. Broker authority pending.</p>
                <p>Compliance verified. Ready for Q4 2025.</p>
              </div>
            </main>
          );
        }