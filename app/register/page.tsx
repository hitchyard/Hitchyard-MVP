'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import Disclaimer from '../components/Disclaimer';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    zipCode: '',
    mcNumber: '',
    dotNumber: '',
    cargoPolicyNumber: '',
    autoLiabilityPolicyNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          userType: 'Carrier',
          complianceDate: undefined,
          companyName: form.companyName,
          zipCode: form.zipCode,
          mcNumber: form.mcNumber,
          dotNumber: form.dotNumber,
          cargoPolicyNumber: form.cargoPolicyNumber,
          autoLiabilityPolicyNumber: form.autoLiabilityPolicyNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.details || 'Registration failed');
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />

      {!submitted ? (
        <main className="min-h-screen bg-charcoal-black text-white flex items-center justify-center py-[200px] px-6">
          <div className="w-full max-w-3xl">
            <h1 className="font-serif text-6xl tracking-[0.8em] uppercase text-center mb-12">APPLY FOR ACCESS</h1>
            <p className="text-center text-white text-[12px] tracking-[0.4em] uppercase mb-16">
              The Grit Club • Carrier Vetting
            </p>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <input name="email" type="email" required placeholder="COMPANY EMAIL" value={form.email} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="password" type="password" required placeholder="PASSWORD" value={form.password} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="companyName" required placeholder="COMPANY NAME" value={form.companyName} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="zipCode" required placeholder="ZIP CODE" value={form.zipCode} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="mcNumber" required placeholder="MC NUMBER" value={form.mcNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="dotNumber" placeholder="DOT NUMBER (OPTIONAL)" value={form.dotNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="cargoPolicyNumber" required placeholder="CARGO POLICY NUMBER" value={form.cargoPolicyNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="autoLiabilityPolicyNumber" required placeholder="AUTO LIABILITY POLICY NUMBER" value={form.autoLiabilityPolicyNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-xl font-sans py-4 placeholder:text-white/30 focus:border-white outline-none" />
              </div>

              {error && (
                <div className="text-center text-[11px] uppercase tracking-[0.3em] text-red-400">{error}</div>
              )}

              <div className="flex justify-center pt-4">
                <button type="submit" disabled={submitting}
                  className="px-12 py-5 bg-[#0B1F1A] text-white font-sans font-bold text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all duration-700 disabled:opacity-40 rounded-none">
                  {submitting ? 'PROCESSING…' : 'SUBMIT CREDENTIALS'}
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-charcoal-black text-white flex items-center justify-center py-[200px] px-6 text-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl tracking-[0.8em] uppercase mb-8">CREDENTIALS SUBMITTED</h1>
            <p className="font-serif text-2xl tracking-[0.4em] uppercase text-deep-forest-green">THE VETTING PROCESS HAS BEGUN</p>
          </div>
        </main>
      )}

      <Disclaimer />
    </>
  );
}
