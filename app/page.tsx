'use client';

import React, { useState } from 'react';

// 1. Brand Colors (Source: Brand Guide)
const CHARCOAL = '#1A1D21'; // Primary Authority Color
const GREEN = '#0B1F1A';     // Secondary Trust Color

// 2. State Management for the Funnel
type FunnelStep = 'TYPE_SELECTION' | 'REGISTRATION_FORM' | 'SUCCESS_WAIT';
type UserType = 'SHIPPER' | 'CARRIER' | null;

export default function RegistrationFunnel() {
  const [step, setStep] = useState<FunnelStep>('TYPE_SELECTION');
  const [userType, setUserType] = useState<UserType>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handles the form submission (Step 2)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, send data to your CRM/DB here
    console.log(`Submitting registration for: ${userType}`); 
    
    // Simulate API submission delay
    setTimeout(() => {
      setIsSubmitted(true);
      setStep('SUCCESS_WAIT');
    }, 1000);
  };

  // --- RENDERING LOGIC ---

  // Step 1: User Type Selection
  if (step === 'TYPE_SELECTION') {
    return (
      <main className="w-full max-w-4xl text-center p-8 mt-20">
        <h1 
          className="text-5xl sm:text-7xl tracking-tighter font-extrabold mb-6" 
          style={{ fontFamily: 'Cinzel Bold, serif', color: CHARCOAL }} // Cinzel for Big Declarative Statements
        >
          SECURE YOUR PLATFORM ACCESS.
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-12 font-light">
          Hitchyard is the new operating system for enterprise logistics. Select your role to begin the onboarding process.
        </p>

        <div className="flex justify-center space-x-6 max-w-2xl mx-auto">
          {/* Button 1: Shipper / Enterprise Logistics Partner */}
          <button
            onClick={() => { setUserType('SHIPPER'); setStep('REGISTRATION_FORM'); }}
            className="flex-1 p-8 rounded-lg shadow-xl border-t-4 border-b-4 hover:shadow-2xl transition duration-300"
            style={{ borderColor: CHARCOAL, backgroundColor: '#f9f9f9' }}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: CHARCOAL }}>
              ENTERPRISE LOGISTICS PARTNER
            </h2>
            <p className="text-sm text-gray-500">(Shipper / Freight Broker)</p>
          </button>

          {/* Button 2: Carrier */}
          <button
            onClick={() => { setUserType('CARRIER'); setStep('REGISTRATION_FORM'); }}
            className="flex-1 p-8 rounded-lg shadow-xl border-t-4 border-b-4 hover:shadow-2xl transition duration-300"
            style={{ borderColor: GREEN, backgroundColor: '#f9f9f9' }}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: GREEN }}>
              VERIFIED CARRIER
            </h2>
            <p className="text-sm text-gray-500">(Motor Carrier / Fleet Owner)</p>
          </button>
        </div>
      </main>
    );
  }

  // Step 2: Registration Form
  if (step === 'REGISTRATION_FORM') {
    return (
      <main className="w-full max-w-4xl text-center p-8 mt-20">
        <h1 
          className="text-3xl sm:text-4xl tracking-tight font-extrabold mb-4" 
          style={{ fontFamily: 'Cinzel Bold, serif', color: CHARCOAL }}
        >
          REGISTRATION: {userType === 'SHIPPER' ? 'LOGISTICS PARTNER' : 'VERIFIED CARRIER'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 font-light">
          Finalize your account and secure your place in the new standard.
        </p>

        {/* Form (Adheres to Geometric/Structured Style) */}
        <div className="card max-w-md mx-auto p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Full Name / Authority"
              required
              className="p-3 border border-gray-300 rounded-md focus:border-gray-500 text-base text-gray-800"
            />
            <input
              type="email"
              placeholder="Official Company Email"
              required
              className="p-3 border border-gray-300 rounded-md focus:border-gray-500 text-base text-gray-800"
            />
            <input
              type="text"
              placeholder="Company Name (Legal Entity)"
              required
              className="p-3 border border-gray-300 rounded-md focus:border-gray-500 text-base text-gray-800"
            />
            <button
              type="submit"
              className="p-3 mt-4 text-white font-semibold rounded-md transition duration-200 hover:opacity-90 shadow-lg"
              style={{ backgroundColor: GREEN }} // Green for Trust/Verification Action
            >
              FINALIZE REGISTRATION
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Step 3: Success/Wait Screen
  return (
    <main className="w-full max-w-2xl text-center p-10 mt-20">
      <h1 
        className="text-4xl sm:text-5xl tracking-tighter font-extrabold mb-4" 
        style={{ fontFamily: 'Cinzel Bold, serif', color: GREEN }} // Green for a Verified/Secured message
      >
        ACCESS GRANTED. THE SYSTEM IS READY.
      </h1>
      <p className="text-lg text-gray-700 max-w-md mx-auto mb-6">
        Your registration as a **{userType === 'SHIPPER' ? 'LOGISTICS PARTNER' : 'VERIFIED CARRIER'}** is complete.
      </p>

      {/* Compliance Box */}
      <div className="bg-gray-50 p-6 rounded-lg border-l-4 mx-auto mb-10" style={{ borderColor: CHARCOAL }}>
          <h3 className="text-xl font-bold mb-2" style={{ color: CHARCOAL }}>Official Compliance Notice</h3>
          <p className="text-md text-gray-800 font-light">
              Your account will be provisioned immediately following the activation of our full broker authority.
          </p>
          <p className="text-lg font-extrabold mt-3" style={{ color: CHARCOAL }}>
              Activation Date: **JANUARY 2, 2025**
          </p>
      </div>

      <p className="text-sm text-gray-500 mt-12">
        A detailed compliance verification email is being sent to your official company address.
      </p>
    </main>
  );
}
