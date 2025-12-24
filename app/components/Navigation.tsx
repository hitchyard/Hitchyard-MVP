'use client';

import { useRouter } from 'next/navigation';

/**
 * IMPERIAL NAVIGATION - COMMAND VOCABULARY
 * High-authority terminology for the Ruler Archetype
 */
export default function Navigation() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: H Mark */}
        <button
          onClick={() => router.push('/')}
          aria-label="Home"
          className="text-charcoal text-[12px] font-cinzel font-bold tracking-imperial uppercase hover:opacity-70"
        >
          H
        </button>
        {/* Right: LOGIN */}
        <button
          onClick={() => router.push('/login')}
          className="text-charcoal text-[10px] font-spartan uppercase tracking-command hover:opacity-70"
        >
          LOGIN
        </button>
      </div>
    </nav>
  );
}
