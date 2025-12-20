'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * NAVIGATION - A&F HIGH-LUXURY AESTHETIC
 * Transparent nav with white H favicon and minimal text links
 */
export default function Navigation() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-12 py-8 flex items-center justify-between">
        {/* Left: White H Favicon */}
        <button 
          onClick={() => router.push('/')}
          className="text-white text-2xl font-serif font-bold tracking-wider hover:opacity-80 transition-opacity"
        >
          H
        </button>

        {/* Right: Minimal Text Links */}
        <div className="flex items-center gap-12">
          <button
            onClick={() => router.push('/register')}
            className="text-white text-[10px] font-sans uppercase tracking-[0.3em] hover:opacity-60 transition-opacity"
          >
            Apply
          </button>
          <button
            onClick={() => router.push('/loads')}
            className="text-white text-[10px] font-sans uppercase tracking-[0.3em] hover:opacity-60 transition-opacity"
          >
            Loads
          </button>
          <button
            onClick={() => router.push('/login')}
            className="text-white text-[10px] font-sans uppercase tracking-[0.3em] hover:opacity-60 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
