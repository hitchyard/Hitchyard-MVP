'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Disclaimer from '../components/Disclaimer';

const steps = [
  'Business Info',
  'Vetting',
  'Complete',
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
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
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmitBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const onSubmitVetting = async (e: React.FormEvent) => {
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
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-charcoal-black text-white flex flex-col items-center justify-center py-[120px] px-6">
        <div className="w-full max-w-2xl">
          <Stepper currentStep={step} />

          {step === 0 && (
            <form onSubmit={onSubmitBusiness} className="space-y-8 mt-16">
              <h1 className="font-serif text-4xl tracking-[0.8em] uppercase text-center mb-8">Business Info</h1>
              <div className="grid grid-cols-1 gap-8">
                <input name="companyName" required placeholder="COMPANY NAME" value={form.companyName} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="zipCode" required placeholder="ZIP CODE" value={form.zipCode} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="mcNumber" required placeholder="MC NUMBER" value={form.mcNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="dotNumber" placeholder="DOT NUMBER (OPTIONAL)" value={form.dotNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
              </div>
              <div className="flex justify-center pt-4">
                <button type="submit" className="px-12 py-5 bg-forest text-white font-sans font-bold text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all duration-700 rounded-none">
                  Next: Vetting
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={onSubmitVetting} className="space-y-8 mt-16">
              <h1 className="font-serif text-4xl tracking-[0.8em] uppercase text-center mb-8">Vetting</h1>
              <div className="grid grid-cols-1 gap-8">
                <input name="email" type="email" required placeholder="COMPANY EMAIL" value={form.email} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="password" type="password" required placeholder="PASSWORD" value={form.password} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="cargoPolicyNumber" required placeholder="CARGO POLICY NUMBER" value={form.cargoPolicyNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white focus:border-white outline-none" />
                <input name="autoLiabilityPolicyNumber" required placeholder="AUTO LIABILITY POLICY NUMBER" value={form.autoLiabilityPolicyNumber} onChange={onChange}
                  className="w-full border-b-2 border-white/20 bg-transparent text-white text-lg font-sans py-4 placeholder:text-white/30 focus:border-white outline-none" />
              </div>
              {error && (
                <div className="text-center text-[11px] uppercase tracking-[0.3em] text-red-400">{error}</div>
              )}
              <div className="flex justify-center pt-4">
                <button type="submit" disabled={submitting}
                  className="px-12 py-5 bg-forest text-white font-sans font-bold text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all duration-700 disabled:opacity-40 rounded-none">
                  {submitting ? 'PROCESSING…' : 'Submit Credentials'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center mt-24">
              <h1 className="font-serif text-4xl md:text-5xl tracking-[0.8em] uppercase mb-8 text-center">COMPLETE</h1>
              <p className="font-serif text-2xl tracking-[0.4em] uppercase text-forest text-center">Vetting Process Started</p>
              <p className="text-center text-white/70 mt-4">You will be notified by email once your application is reviewed.</p>
            </div>
          )}
        </div>
      </main>
      <Disclaimer />
    </>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 font-bold text-lg ${idx === currentStep ? 'bg-forest text-white' : 'bg-white/10 text-white/60'} rounded-none border-2 border-forest`}>{idx + 1}</div>
          <span className={`ml-2 mr-4 text-sm font-sans uppercase tracking-widest ${idx === currentStep ? 'text-forest' : 'text-white/60'}`}>{label}</span>
          {idx < steps.length - 1 && <div className="w-8 h-1 bg-forest" />}
        </div>
      ))}
    </div>
  );
}
