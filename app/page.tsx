'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// 1. Brand Colors (Source: Brand Guide)
const CHARCOAL = '#1A1D21'; // Primary Authority Color
const GREEN = '#0B1F1A';     // Secondary Trust Color
const WHITE = '#FFFFFF';    // Contrast Color

// 2. State Management for the Funnel
type FunnelStep = 'TYPE_SELECTION' | 'REGISTRATION_FORM' | 'SUCCESS_WAIT';
type UserType = 'SHIPPER' | 'CARRIER' | null;

export default function RegistrationFunnel() {
  const [step, setStep] = useState<FunnelStep>('TYPE_SELECTION');
  const [userType, setUserType] = useState<UserType>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handles the form submission (Step 2)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Collect Form Data
    const formData = new FormData(e.currentTarget);
    // Note: We use the names from the input fields in the JSX
    const full_name = formData.get('full_name') as string;
    const company_email = formData.get('company_email') as string;
    const company_name = formData.get('company_name') as string;

    // Basic validation
    if (!full_name || !company_email || !company_name || !userType) {
      console.error('Form data or user type is missing.');
      return;
    }

    // 2. Insert Data into Supabase
    const { error } = await supabase
      .from('registrations')
      .insert({
        full_name,
        company_email,
        company_name,
        user_type: userType,
      });

    // 3. Error Handling and State Update
    if (error) {
      console.error('Supabase registration error:', error);
      // Inform the user if an error occurred (e.g., email already exists)
      alert('Registration failed. Please try again. Error: ' + error.message);
      return;
    }

    // Success: Transition to the SUCCESS_WAIT step
    // The state transition (setStep) must happen ONLY after a successful API call.
    setIsSubmitted(true);
    setStep('SUCCESS_WAIT');
  };

  // --- RENDERING LOGIC ---
  let Content;

  // Step 1: User Type Selection
  if (step === 'TYPE_SELECTION') {
    Content = (
      <div className="w-full max-w-4xl">
        <h1 
          className="text-5xl sm:text-7xl tracking-tighter font-extrabold mb-6 font-cinzel" 
          style={{ color: WHITE }}
        >
          SECURE YOUR PLATFORM ACCESS.
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-16 font-spartan" style={{ color: '#E0E0E0' }}>
          Hitchyard is the new operating system for enterprise logistics. Select your role to begin the onboarding process.
        </p>

        <div className="flex justify-center space-x-8 max-w-4xl mx-auto">
          {/* Button 1: Shipper / Enterprise Logistics Partner (CHARCOAL for Authority/Platform) */}
          <button
            onClick={() => { setUserType('SHIPPER'); setStep('REGISTRATION_FORM'); }}
            className="flex-1 p-10 rounded-lg shadow-2xl border-2 hover:shadow-3xl transition duration-300 transform hover:scale-[1.02] font-spartan"
            style={{ borderColor: CHARCOAL, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <h2 className="text-2xl font-bold mb-2 font-spartan" style={{ color: CHARCOAL }}>
              ENTERPRISE LOGISTICS PARTNER
            </h2>
            <p className="text-sm text-gray-600">(Shipper / Freight Broker)</p>
          </button>

          {/* Button 2: Carrier (GREEN for Trust/Verified) */}
          <button
            onClick={() => { setUserType('CARRIER'); setStep('REGISTRATION_FORM'); }}
            className="flex-1 p-10 rounded-lg shadow-2xl border-2 hover:shadow-3xl transition duration-300 transform hover:scale-[1.02] font-spartan"
            style={{ borderColor: GREEN, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <h2 className="text-2xl font-bold mb-2 font-spartan" style={{ color: GREEN }}>
              VERIFIED CARRIER
            </h2>
            <p className="text-sm text-gray-600">(Motor Carrier / Fleet Owner)</p>
          </button>
        </div>
      </div>
    );

  // Step 2: Registration Form
  } else if (step === 'REGISTRATION_FORM') {
    Content = (
      <div className="w-full max-w-4xl">
        <h1 
          className="text-4xl sm:text-5xl tracking-tight font-extrabold mb-4 font-cinzel" 
          style={{ color: WHITE }}
        >
          REGISTRATION: {userType === 'SHIPPER' ? 'LOGISTICS PARTNER' : 'VERIFIED CARRIER'}
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10 font-spartan" style={{ color: '#E0E0E0' }}>
          Finalize your qualification and secure your place in the new standard.
        </p>

        {/* Form (Structured and Geometric) */}
        <div className="card max-w-md mx-auto p-8 shadow-2xl rounded-lg" style={{ backgroundColor: WHITE }}>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name / Authority"
              required
              className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 text-base text-gray-800 font-spartan"
            />
            <input
              type="email"
              name="company_email"
              placeholder="Official Company Email"
              required
              className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 text-base text-gray-800 font-spartan"
            />
            <input
              type="text"
              name="company_name"
              placeholder="Company Name (Legal Entity)"
              required
              className="p-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-500 text-base text-gray-800 font-spartan"
            />
            <button
              type="submit"
              className="p-4 mt-6 text-white text-lg font-semibold rounded-md transition duration-200 hover:opacity-90 shadow-lg font-spartan"
              style={{ backgroundColor: GREEN }} // Green for Trust/Verification Action
            >
              FINALIZE REGISTRATION
            </button>
          </form>
        </div>
      </div>
    );

  // Step 3: Success/Wait Screen (Default)
  } else {
    Content = (
      <div className="w-full max-w-2xl">
        <h1 
          className="text-5xl sm:text-6xl tracking-tighter font-extrabold mb-4 font-cinzel" 
          style={{ color: GREEN }} // Green for a Verified/Secured message
        >
          ACCESS GRANTED. THE SYSTEM IS READY.
        </h1>
        <p className="text-xl max-w-xl mx-auto mb-10 font-spartan" style={{ color: '#E0E0E0' }}>
          Your registration as a **{userType === 'SHIPPER' ? 'LOGISTICS PARTNER' : 'VERIFIED CARRIER'}** is complete.
        </p>

        {/* Compliance Box (Highlights Authority and Date) */}
        <div className="p-8 rounded-lg border-l-4 mx-auto mb-10 shadow-xl font-spartan" style={{ backgroundColor: WHITE, borderColor: CHARCOAL }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: CHARCOAL }}>Official Compliance Notice</h3>
            <p className="text-md text-gray-800 font-light">
                Your account will be provisioned immediately following the activation of our full broker authority.
            </p>
            <p className="text-2xl font-extrabold mt-4" style={{ color: CHARCOAL }}>
                Activation Date: **JANUARY 2, 2025**
            </p>
        </div>

        {/* Compliance Disclaimer */}
        <div className="mt-12 text-sm max-w-md mx-auto p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <p className="text-gray-300">
                Hitchyard, Inc. operates as a technology platform with full broker authority pending activation on January 2, 2025. Hitchyard is not a motor carrier.
            </p>
        </div>

        <p className="text-sm text-gray-400 mt-8 font-spartan">
          A detailed compliance verification email is being sent to your official company address.
        </p>
      </div>
    );
  }

  // Single top-level return statement (unconditional)
  return (
    // Outer container for fixed video background and charcoal overlay
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center">
      
      {/* Background Video Element */}
      <video
        autoPlay
        loop
        muted
        className="fixed inset-0 object-cover w-full h-full z-0"
        src="/video/hitchyard-intro.mp4" 
      />

      {/* Charcoal Overlay */}
      <div 
        className="fixed inset-0 z-10" 
        style={{ backgroundColor: CHARCOAL, opacity: 0.6 }} 
      />

      {/* Content Wrapper (Relative to the fixed background) */}
      <div className="relative z-20 w-full max-w-5xl text-center p-8 pt-20 pb-20 flex-grow flex flex-col items-center">
        
        {/* Logo Mark */}
        <div className="mb-10 text-6xl font-extrabold font-cinzel" style={{ color: WHITE }}>
            H
        </div>

        {/* The Content: Conditionally rendered JSX based on the step state */}
        {Content}
        
      </div>
    </div>
  );
}
