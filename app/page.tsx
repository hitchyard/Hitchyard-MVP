'use client'

import { useState } from 'react'

export default function HeroForm() {
  const [status, setStatus] = useState<null | 'ELITE' | 'DENIED' | 'PENDING'>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    mcDotNumber: ''
  })

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  const formComplete = Boolean(formData.companyName.trim() && formData.mcDotNumber.trim() && emailValid)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/vetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      setStatus(data.status ?? 'PENDING')
    } catch (err) {
      console.error('Vetting failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-charcoal text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-cinzel text-5xl font-bold tracking-[0.6em] uppercase mb-8 text-center">HITCHYARD</h1>
        <div className="h-px w-20 bg-white/20 mx-auto mb-8" />

        <form onSubmit={handleApply} className="space-y-6">
          <div>
            <label className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-2 block">Company Name</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full bg-charcoal text-white rounded-none px-4 py-3 placeholder:text-white/40 focus:outline-none border border-white/10"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-charcoal text-white rounded-none px-4 py-3 placeholder:text-white/40 focus:outline-none border border-white/10"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-2 block">MC/DOT Number</label>
            <input
              name="mcDotNumber"
              value={formData.mcDotNumber}
              onChange={handleChange}
              className="w-full bg-charcoal text-white rounded-none px-4 py-3 placeholder:text-white/40 focus:outline-none border border-white/10"
              placeholder="MC or DOT"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formComplete}
            className="bg-white text-charcoal px-12 py-4 font-cinzel text-xs tracking-[0.4em] uppercase font-bold rounded-none hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'VETTING…' : 'APPLY FOR ACCESS'}
          </button>
        </form>

        {status === 'ELITE' && (
          <div className="mt-8 inline-block px-6 py-3 bg-forest text-white font-spartan text-[11px] tracking-[0.2em] uppercase rounded-none">
            ✓ ELITE STATUS GRANTED
          </div>
        )}
        {status === 'DENIED' && (
          <div className="mt-8 inline-block px-6 py-3 bg-charcoal text-white font-spartan text-[11px] tracking-[0.2em] uppercase rounded-none border border-white/10">
            ACCESS RESTRICTED
          </div>
        )}
      </div>
    </main>
  )
}
