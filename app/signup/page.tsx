'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-cinzel font-bold text-[#FFFFFF] mb-2">
          <span className="text-[#0B1F1A]">H</span>ITCHYARD
        </h1>
        <p className="text-[#E0E0E0] font-spartan text-lg">The Grit Club Freight Network</p>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md">
        
        {/* STEP 1: TYPE SELECTION */}
        {step === 'TYPE_SELECTION' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-cinzel font-bold text-[#FFFFFF] text-center mb-8">
              Who Are You?
            </h2>

            <button
              onClick={handleTypeSelection}
              className="w-full p-6 border-2 border-[#0B1F1A] rounded-lg text-center hover:bg-[#0B1F1A] transition-colors duration-200"
            >
              <p className="text-[#FFFFFF] font-cinzel text-xl font-bold">CARRIER</p>
              <p className="text-[#E0E0E0] font-spartan text-sm mt-2">
                Join the Grit Club dispatch network
              </p>
            </button>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {step === 'REGISTRATION_FORM' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-cinzel font-bold text-[#FFFFFF] text-center mb-6">
              Carrier Registration
            </h2>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg">
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
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="email"
              name="email"
              placeholder="Company Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="date"
              name="complianceDate"
              value={formData.complianceDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="text"
              name="cargoPolicyNumber"
              placeholder="Cargo Policy Number"
              value={formData.cargoPolicyNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <input
              type="text"
              name="autoLiabilityPolicyNumber"
              placeholder="Auto Liability Policy Number"
              value={formData.autoLiabilityPolicyNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#666666] font-spartan focus:outline-none focus:border-[#0B1F1A]"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0B1F1A] text-[#FFFFFF] font-cinzel font-bold rounded-lg hover:bg-[#0F2A24] transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'REGISTER'}
            </button>

            <button
              type="button"
              onClick={() => setStep('TYPE_SELECTION')}
              className="w-full py-2 text-[#E0E0E0] font-spartan text-sm hover:text-[#FFFFFF] transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'SUCCESS_WAIT' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#0B1F1A] rounded-full flex items-center justify-center">
              <span className="text-2xl text-[#FFFFFF]">✓</span>
            </div>
            <h2 className="text-2xl font-cinzel font-bold text-[#FFFFFF]">Registration Complete</h2>
            <p className="text-[#E0E0E0] font-spartan">
              Welcome to the Grit Club. Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
