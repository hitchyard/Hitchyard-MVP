'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

const CHARCOAL_BLACK = '#1A1D21';
const DEEP_FOREST_GREEN = '#0B1F1A';
const REQUIRED_CARGO = '$100,000';
const REQUIRED_AUTO = '$1,000,000';

type FormDataState = {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  complianceDate: string;
  zipCode: string;
  cargoPolicyNumber: string;
  autoLiabilityPolicyNumber: string;
};

const GritClubLanding = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName || !formData.companyName) {
      setError('All fields are required.');
      return;
    }

    const zipRegex = /^\d{5}(?:-\d{4})?$/;
    if (!formData.zipCode.startsWith('84')) {
      setError('Zip Code must be in the Salt Lake City 250-mile service area (e.g., starts with 84).');
      return;
    }
    if (!zipRegex.test(formData.zipCode)) {
      setError('Enter a valid US ZIP code.');
      return;
    }
    if (!formData.cargoPolicyNumber.trim() || !formData.autoLiabilityPolicyNumber.trim()) {
      setError('Cargo and Auto Liability policy numbers are required.');
      return;
    }

    setIsLoading(true);

    try {
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

      const client = supabase();
      const { error: signInError } = await client.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Registration succeeded, but sign-in failed. Please log in manually.');
        setIsLoading(false);
        return;
      }

      router.push('/carrier-platform');
    } catch (err) {
      console.error('Grit Club registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-8 flex items-center justify-center"
      style={{ backgroundColor: CHARCOAL_BLACK }}
    >
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 p-8 bg-white shadow-2xl rounded-lg">
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl font-cinzel mb-4" style={{ color: DEEP_FOREST_GREEN }}>
            SECURE YOUR STANDING. JOIN THE GRIT CLUB.
          </h1>
          <p className="text-xl font-league-spartan text-charcoal">
            The premium, short-haul freight marketplace for **Sprinter, Express, and Box Truck** operators in the
            250-mile Salt Lake radius.
          </p>

          <div className="p-4 rounded-lg border-2 border-deep-green" style={{ backgroundColor: '#F8F8F8' }}>
            <h3 className="text-lg font-cinzel text-charcoal mb-2">THE INSURANCE STANDARD</h3>
            <p className="text-sm font-league-spartan">
              Hitchyard requires all carriers to match our Contingent Liability policy limits to qualify for vetting:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm font-league-spartan font-bold" style={{ color: DEEP_FOREST_GREEN }}>
              <li>Cargo Policy: {REQUIRED_CARGO} Minimum</li>
              <li>Auto Liability: {REQUIRED_AUTO} Minimum</li>
            </ul>
          </div>

          <p className="text-sm font-league-spartan text-gray-600">
            *Final approval is manual. Submission grants access to the Pre-Launch Dashboard.*
          </p>
        </div>

        <div className="p-6 rounded-lg border border-gray-300">
          <h2 className="text-2xl font-cinzel text-charcoal mb-6">STEP 1: GRIT CLUB VETTING</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded border border-red-500 bg-red-50 text-red-700 text-sm font-league-spartan">
                {error}
              </div>
            )}

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Company Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="date"
              name="complianceDate"
              placeholder="Compliance Date"
              value={formData.complianceDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <h3 className="text-lg font-cinzel pt-4 pb-2 border-t mt-4" style={{ borderColor: DEEP_FOREST_GREEN }}>
              Compliance Data
            </h3>

            <input
              type="text"
              name="zipCode"
              placeholder="Primary Service ZIP Code (Required for SLC Area)"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="text"
              name="cargoPolicyNumber"
              placeholder="Cargo Policy Number"
              value={formData.cargoPolicyNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <input
              type="text"
              name="autoLiabilityPolicyNumber"
              placeholder="Auto Liability Policy Number"
              value={formData.autoLiabilityPolicyNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 text-white text-lg font-bold rounded mt-6"
              style={{ backgroundColor: DEEP_FOREST_GREEN }}
              disabled={isLoading}
            >
              {isLoading ? 'APPLYING VETTING...' : 'APPLY FOR GRIT CLUB VETTING'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GritClubLanding;
