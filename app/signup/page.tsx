'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with validation
function initializeSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // Return a client with placeholder values to prevent crash
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

const supabase = initializeSupabase();

export default function RegistrationFunnel() {
  const router = useRouter();
  
  const [step, setStep] = useState('TYPE_SELECTION');
  const [formData, setFormData] = useState({
    userType: 'Carrier',
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    complianceDate: '',
    zipCode: '',
    cargoPolicyNumber: '',
    autoLiabilityPolicyNumber: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeSelection = () => {
    setFormData({ ...formData, userType: 'Carrier' });
    setStep('REGISTRATION_FORM');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation for required vetting fields
    const zipRegex = /^\d{5}(?:-\d{4})?$/;
    if (!zipRegex.test(formData.zipCode)) {
      setError('Enter a valid US ZIP code.');
      setIsLoading(false);
      return;
    }
    if (!formData.cargoPolicyNumber.trim() || !formData.autoLiabilityPolicyNumber.trim()) {
      setError('Cargo and Auto Liability policy numbers are required.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Call the server-side sign-up endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: 'Carrier',
          complianceDate: formData.complianceDate,
          companyName: formData.companyName,
          zipCode: formData.zipCode,
          cargoPolicyNumber: formData.cargoPolicyNumber,
          autoLiabilityPolicyNumber: formData.autoLiabilityPolicyNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Manually sign the user in client-side to set the session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Registration successful, but automatic sign-in failed. Please log in manually.');
        setStep('SUCCESS_WAIT');
        setIsLoading(false);
        return;
      }

      // SUCCESS: Show success state then redirect
      setStep('SUCCESS_WAIT');
      setTimeout(() => {
        router.push('/carrier-platform');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#1A1D21] opacity-70 z-0"></div>

      {/* Main Content Container - White Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white  rounded-none p-10">
        
        {/* Logo/Wordmark */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-[family-name:var(--font-cinzel)] font-bold text-[#1A1D21] tracking-tight uppercase">
            HITCHYARD
          </h1>
        </div>

        {/* STEP 1: TYPE SELECTION */}
        {step === 'TYPE_SELECTION' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-[#1A1D21] text-center mb-4">
              APPLY FOR ACCESS.
            </h2>
            <p className="text-center text-gray-600 font-[family-name:var(--font-league-spartan)] text-lg mb-8">
              The Vetting Process for America's Most Reliable Carriers.
            </p>

            <button
              onClick={handleTypeSelection}
              className="w-full p-6 border-2 border-[#0B1F1A] rounded-none text-center hover:bg-[#0B1F1A] hover:text-white transition-colors duration-200 bg-white"
            >
              <p className="font-[family-name:var(--font-cinzel)] text-xl font-bold text-[#1A1D21]">CARRIER</p>
              <p className="font-[family-name:var(--font-league-spartan)] text-sm mt-2 text-gray-600">
                Join the Grit Club dispatch network
              </p>
            </button>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {step === 'REGISTRATION_FORM' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-[#1A1D21] text-center mb-2">
              APPLY FOR ACCESS.
            </h2>
            <p className="text-center text-gray-600 font-[family-name:var(--font-league-spartan)] text-lg mb-6">
              The Vetting Process for America's Most Reliable Carriers.
            </p>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-600 rounded-none">
                <p className="text-red-300 font-spartan text-sm">{error}</p>
              </div>
            )}

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="email"
              name="email"
              placeholder="Company Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="date"
              name="complianceDate"
              value={formData.complianceDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
            />

            <div className="space-y-2">
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
              />
              {/* Grit Club Priority Region Badge */}
              {formData.zipCode.startsWith('84') && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0B1F1A] rounded-none">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-[family-name:var(--font-league-spartan)] font-semibold text-sm">
                    Priority Region Detected: Grit Club Eligible
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-[family-name:var(--font-league-spartan)] font-medium text-[#1A1D21] mb-2">
                Cargo Policy Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="cargoPolicyNumber"
                placeholder="Cargo Policy Number"
                value={formData.cargoPolicyNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
              />
            </div>

            <div>
              <label className="block text-sm font-[family-name:var(--font-league-spartan)] font-medium text-[#1A1D21] mb-2">
                Auto Liability Policy Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="autoLiabilityPolicyNumber"
                placeholder="Auto Liability Policy Number"
                value={formData.autoLiabilityPolicyNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-none text-[#1A1D21] placeholder-gray-500 font-[family-name:var(--font-league-spartan)] focus:outline-none focus:border-[#0B1F1A]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 bg-[#0B1F1A] text-white font-[family-name:var(--font-cinzel)] font-bold text-lg uppercase tracking-wider rounded-none hover:bg-[#0F2A24] transition-colors duration-200 disabled:opacity-50 "
            >
              {isLoading ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
            </button>

            <button
              type="button"
              onClick={() => setStep('TYPE_SELECTION')}
              className="w-full py-2 text-gray-600 font-[family-name:var(--font-league-spartan)] text-sm hover:text-[#1A1D21] transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'SUCCESS_WAIT' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#0B1F1A] rounded-none flex items-center justify-center">
              <span className="text-2xl text-white">✓</span>
            </div>
            <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-[#1A1D21]">APPLICATION SUBMITTED</h2>
            <p className="text-gray-600 font-[family-name:var(--font-league-spartan)]">
              Welcome to the Grit Club. Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
