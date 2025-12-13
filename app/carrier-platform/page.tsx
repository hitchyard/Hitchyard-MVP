'use client';

import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, Package, DollarSign, Shield, Bell, Settings } from 'lucide-react';

// Brand Colors (Ruler Archetype)
const CHARCOAL = '#1A1D21';
const GREEN = '#0B1F1A';
const WHITE = '#FFFFFF';

// --- MOCK DATA FOR COMPLIANCE LEDGER (The Grit Club Trust Signals) ---
const mockComplianceStatus = [
  { label: 'MC Authority', status: 'Verified', color: GREEN },
  { label: '$75K Surety Bond', status: 'Verified', color: GREEN },
  { label: 'Cargo Liability Ins.', status: 'Verified', color: GREEN },
  { label: 'Auto Liability Ins.', status: 'Verified', color: GREEN },
  { label: 'QuickPay Enrollment', status: 'Verified', color: GREEN },
];

// Component for the Compliance Ledger
const ComplianceLedger = () => (
  <div className="p-6 rounded-lg bg-white shadow-xl border border-gray-200">
    <h3 className="font-cinzel text-xl text-charcoal mb-4">COMPLIANCE LEDGER</h3>
    <ul className="space-y-3">
      {mockComplianceStatus.map((item) => (
        <li key={item.label} className="flex justify-between items-center text-league-spartan">
          <span className="text-charcoal">{item.label}</span>
          <span 
            className="px-3 py-1 rounded text-white text-sm font-bold"
            style={{ backgroundColor: item.color }} 
          >
            {item.status}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default function HitchyardPlatformShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- PRE-LAUNCH GATE LOGIC ---
  const LAUNCH_DATE = new Date('January 2, 2026');
  const isPreLaunch = new Date() < LAUNCH_DATE;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Loads', active: false },
    { icon: DollarSign, label: 'Finance', active: false },
    { icon: Shield, label: 'Compliance', active: false },
  ];

  // --- PRE-LAUNCH GATE VIEW ---
  if (isPreLaunch) {
    return (
      <div 
        className="min-h-screen p-8 flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: CHARCOAL }}
      >
        <div className="max-w-xl p-10 bg-white rounded-lg shadow-2xl mb-8">
          <h1 className="text-4xl font-cinzel text-green-700 mb-4">
            THE HITCHYARD STANDARD IS IMMINENT.
          </h1>
          <p className="text-lg font-spartan text-charcoal mb-8">
            Welcome to the Grit Club. Your MC Authority activates on <strong>January 2, 2026</strong>. 
            Your load board will activate at 12:01 AM MST. Review your Compliance Ledger below, and stand by for Day 1 loads.
          </p>
        </div>
        
        {/* Only the Compliance Ledger is visible beneath the main message */}
        <div className="w-full max-w-lg">
           <ComplianceLedger />
        </div>
      </div>
    );
  }

  // --- STANDARD DASHBOARD VIEW (If isPreLaunch is FALSE) ---
  return (
    <div style={{ backgroundColor: CHARCOAL }} className="min-h-screen w-full font-spartan text-white flex flex-col">
      {/* ===== TOP HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: GREEN }}>
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-800 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-3xl font-bold font-cinzel tracking-widest">
            <span style={{ color: GREEN }}>H</span>ITCHYARD
          </h1>
        </div>

        {/* User Profile / System Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: 'rgba(11, 31, 26, 0.3)' }}>
            <span className="text-xs font-semibold text-gray-400">USER ID:</span>
            <span className="font-mono text-sm" style={{ color: GREEN }}>VERIFIED_UID_001</span>
          </div>
          <button className="p-2 rounded hover:bg-gray-800 transition">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside
          className={`
            ${sidebarOpen ? 'w-full md:w-1/5' : 'w-0'}
            transition-all duration-300 ease-in-out overflow-hidden
            border-r flex flex-col
          `}
          style={{ borderColor: GREEN, backgroundColor: 'rgba(26, 29, 33, 0.8)' }}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b" style={{ borderColor: GREEN }}>
            <h2 className="font-cinzel font-bold text-sm tracking-wider uppercase">Navigation</h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors
                    font-spartan text-sm font-semibold uppercase tracking-wider
                  `}
                  style={{
                    backgroundColor: item.active ? GREEN : 'transparent',
                    color: item.active ? WHITE : '#A0A0A0',
                    borderLeft: item.active ? `4px solid ${WHITE}` : '4px solid transparent',
                  }}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t text-xs text-gray-500" style={{ borderColor: GREEN }}>
            <p className="font-spartan">System Status: <span style={{ color: GREEN }}>NOMINAL</span></p>
          </div>
        </aside>

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* ===== WELCOME SECTION ===== */}
            <section>
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold mb-2">Load Dispatch Authority</h1>
              <p className="text-gray-400 font-spartan text-lg">
                Active Order Management & Compliance Verification System
              </p>
            </section>

            {/* ===== KEY METRICS CARDS ===== */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Loads', value: '12', unit: 'In Transit' },
                { label: 'Total Revenue', value: '$24,580', unit: 'This Month' },
                { label: 'Compliance Score', value: '98%', unit: 'Verified' },
                { label: 'Response Time', value: '4.2h', unit: 'Average' },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="p-6 rounded-none border"
                  style={{ backgroundColor: 'rgba(26, 29, 33, 0.6)', borderColor: GREEN }}
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-cinzel font-bold mb-1" style={{ color: GREEN }}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-400 font-spartan">{metric.unit}</p>
                </div>
              ))}
            </section>

            {/* ===== ACTIVE LOADS SECTION ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">Active Loads (Dispatch Queue)</h2>
              <div className="border rounded-none" style={{ borderColor: GREEN }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(11, 31, 26, 0.3)', borderBottom: `1px solid ${GREEN}` }}>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Load ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Route</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Weight</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'LOAD-001', route: 'Chicago → Dallas', weight: '18,000 lbs', status: 'In Transit', revenue: '$2,400' },
                        { id: 'LOAD-002', route: 'Atlanta → Miami', weight: '22,500 lbs', status: 'Dispatched', revenue: '$1,950' },
                        { id: 'LOAD-003', route: 'Seattle → Portland', weight: '15,000 lbs', status: 'Accepted', revenue: '$1,200' },
                        { id: 'LOAD-004', route: 'Houston → New Orleans', weight: '20,000 lbs', status: 'Assigned', revenue: '$1,875' },
                      ].map((load, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: `1px solid rgba(11, 31, 26, 0.5)` }}
                          className="hover:bg-gray-900 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm" style={{ color: GREEN }}>
                            {load.id}
                          </td>
                          <td className="px-6 py-4 font-spartan text-sm">{load.route}</td>
                          <td className="px-6 py-4 font-spartan text-sm">{load.weight}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 text-xs font-semibold uppercase rounded-none"
                              style={{ backgroundColor: GREEN, color: CHARCOAL }}
                            >
                              {load.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold" style={{ color: GREEN }}>
                            {load.revenue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ===== CREDIT COMPLIANCE LEDGER ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">Credit Compliance Ledger</h2>
              <div
                className="p-6 rounded-none border space-y-4"
                style={{ backgroundColor: 'rgba(26, 29, 33, 0.6)', borderColor: GREEN }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Account Balance
                    </p>
                    <p className="text-3xl font-cinzel font-bold" style={{ color: GREEN }}>
                      $4,250
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Available Credit
                    </p>
                    <p className="text-3xl font-cinzel font-bold" style={{ color: GREEN }}>
                      $15,000
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(11, 31, 26, 0.5)' }}>
                  <p className="text-xs text-gray-400 font-spartan mb-2">Last Verification: 2025-01-02 14:32 UTC</p>
                  <p className="text-xs text-gray-400 font-spartan">
                    All payments verified and compliant with broker authority standards.
                  </p>
                </div>
              </div>
            </section>

            {/* ===== SYSTEM STATUS ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">System Authority Status</h2>
              <div
                className="p-6 rounded-none border text-center"
                style={{ backgroundColor: 'rgba(11, 31, 26, 0.2)', borderColor: GREEN }}
              >
                <p className="text-sm text-gray-400 font-spartan mb-2">Broker Authority Activation</p>
                <p className="text-3xl font-cinzel font-bold mb-2" style={{ color: GREEN }}>
                  JANUARY 2, 2026
                </p>
                <p className="text-xs text-gray-400 font-spartan">
                  Platform operating with full regulatory compliance and broker authority verification.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

  return (
    <div style={{ backgroundColor: CHARCOAL }} className="min-h-screen w-full font-spartan text-white flex flex-col">
      {/* ===== TOP HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: GREEN }}>
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-800 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-3xl font-bold font-cinzel tracking-widest">
            <span style={{ color: GREEN }}>H</span>ITCHYARD
          </h1>
        </div>

        {/* User Profile / System Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: 'rgba(11, 31, 26, 0.3)' }}>
            <span className="text-xs font-semibold text-gray-400">USER ID:</span>
            <span className="font-mono text-sm" style={{ color: GREEN }}>VERIFIED_UID_001</span>
          </div>
          <button className="p-2 rounded hover:bg-gray-800 transition">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside
          className={`
            ${sidebarOpen ? 'w-full md:w-1/5' : 'w-0'}
            transition-all duration-300 ease-in-out overflow-hidden
            border-r flex flex-col
          `}
          style={{ borderColor: GREEN, backgroundColor: 'rgba(26, 29, 33, 0.8)' }}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b" style={{ borderColor: GREEN }}>
            <h2 className="font-cinzel font-bold text-sm tracking-wider uppercase">Navigation</h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors
                    font-spartan text-sm font-semibold uppercase tracking-wider
                  `}
                  style={{
                    backgroundColor: item.active ? GREEN : 'transparent',
                    color: item.active ? WHITE : '#A0A0A0',
                    borderLeft: item.active ? `4px solid ${WHITE}` : '4px solid transparent',
                  }}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t text-xs text-gray-500" style={{ borderColor: GREEN }}>
            <p className="font-spartan">System Status: <span style={{ color: GREEN }}>NOMINAL</span></p>
          </div>
        </aside>

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* ===== WELCOME SECTION ===== */}
            <section>
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold mb-2">Load Dispatch Authority</h1>
              <p className="text-gray-400 font-spartan text-lg">
                Active Order Management & Compliance Verification System
              </p>
            </section>

            {/* ===== KEY METRICS CARDS ===== */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Loads', value: '12', unit: 'In Transit' },
                { label: 'Total Revenue', value: '$24,580', unit: 'This Month' },
                { label: 'Compliance Score', value: '98%', unit: 'Verified' },
                { label: 'Response Time', value: '4.2h', unit: 'Average' },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="p-6 rounded-none border"
                  style={{ backgroundColor: 'rgba(26, 29, 33, 0.6)', borderColor: GREEN }}
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-cinzel font-bold mb-1" style={{ color: GREEN }}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-400 font-spartan">{metric.unit}</p>
                </div>
              ))}
            </section>

            {/* ===== ACTIVE LOADS SECTION ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">Active Loads (Dispatch Queue)</h2>
              <div className="border rounded-none" style={{ borderColor: GREEN }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(11, 31, 26, 0.3)', borderBottom: `1px solid ${GREEN}` }}>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Load ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Route</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Weight</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'LOAD-001', route: 'Chicago → Dallas', weight: '18,000 lbs', status: 'In Transit', revenue: '$2,400' },
                        { id: 'LOAD-002', route: 'Atlanta → Miami', weight: '22,500 lbs', status: 'Dispatched', revenue: '$1,950' },
                        { id: 'LOAD-003', route: 'Seattle → Portland', weight: '15,000 lbs', status: 'Accepted', revenue: '$1,200' },
                        { id: 'LOAD-004', route: 'Houston → New Orleans', weight: '20,000 lbs', status: 'Assigned', revenue: '$1,875' },
                      ].map((load, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: `1px solid rgba(11, 31, 26, 0.5)` }}
                          className="hover:bg-gray-900 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm" style={{ color: GREEN }}>
                            {load.id}
                          </td>
                          <td className="px-6 py-4 font-spartan text-sm">{load.route}</td>
                          <td className="px-6 py-4 font-spartan text-sm">{load.weight}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 text-xs font-semibold uppercase rounded-none"
                              style={{ backgroundColor: GREEN, color: CHARCOAL }}
                            >
                              {load.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold" style={{ color: GREEN }}>
                            {load.revenue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ===== CREDIT COMPLIANCE LEDGER ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">Credit Compliance Ledger</h2>
              <div
                className="p-6 rounded-none border space-y-4"
                style={{ backgroundColor: 'rgba(26, 29, 33, 0.6)', borderColor: GREEN }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Account Balance
                    </p>
                    <p className="text-3xl font-cinzel font-bold" style={{ color: GREEN }}>
                      $4,250
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Available Credit
                    </p>
                    <p className="text-3xl font-cinzel font-bold" style={{ color: GREEN }}>
                      $15,000
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(11, 31, 26, 0.5)' }}>
                  <p className="text-xs text-gray-400 font-spartan mb-2">Last Verification: 2025-01-02 14:32 UTC</p>
                  <p className="text-xs text-gray-400 font-spartan">
                    All payments verified and compliant with broker authority standards.
                  </p>
                </div>
              </div>
            </section>

            {/* ===== SYSTEM STATUS ===== */}
            <section>
              <h2 className="text-2xl font-cinzel font-bold mb-4">System Authority Status</h2>
              <div
                className="p-6 rounded-none border text-center"
                style={{ backgroundColor: 'rgba(11, 31, 26, 0.2)', borderColor: GREEN }}
              >
                <p className="text-sm text-gray-400 font-spartan mb-2">Broker Authority Activation</p>
                <p className="text-3xl font-cinzel font-bold mb-2" style={{ color: GREEN }}>
                  JANUARY 2, 2025
                </p>
                <p className="text-xs text-gray-400 font-spartan">
                  Platform operating with full regulatory compliance and broker authority verification.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
