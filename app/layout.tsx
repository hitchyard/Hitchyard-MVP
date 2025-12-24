'use client';

import './globals.css';
import './fonts.css';
import { Component, ReactNode } from 'react';
import { Cinzel, League_Spartan } from 'next/font/google';

// IMPERIAL PROTOCOL: Font Configuration
const cinzel = Cinzel({ 
  subsets: ['latin'], 
  weight: ['700'], // Cinzel Bold only
  display: 'swap', 
  variable: '--font-cinzel' 
});

const spartan = League_Spartan({ 
  subsets: ['latin'], 
  weight: ['300', '400', '600', '700'], 
  display: 'swap', 
  variable: '--font-spartan' 
});


interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary - IMPERIAL PROTOCOL
 * Catches initialization failures with commanding error UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 SYSTEM ERROR:', error);
    console.error('ERROR DETAILS:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <html lang="en">
          <head>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <title>HITCHYARD - System Error</title>
          </head>
          <body className="antialiased bg-charcoal">
            <div className="min-h-screen flex items-center justify-center p-12">
              <div className="max-w-lg w-full bg-white p-16 text-center">
                <h1 className="text-3xl font-cinzel font-bold text-charcoal mb-8 uppercase tracking-imperial">
                  SYSTEM ERROR
                </h1>
                <p className="text-xs text-charcoal/60 uppercase tracking-command mb-8 leading-relaxed font-spartan">
                  The system encountered an issue. <br />
                  Please refresh or contact protocol support.
                </p>
                {this.state.error && (
                  <details className="text-left text-[9px] text-charcoal/40 font-mono bg-charcoal/5 p-4 mb-8">
                    <summary className="cursor-pointer mb-2 uppercase tracking-wider">Technical Details</summary>
                    <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                  </details>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-forest text-white py-5 text-[10px] font-cinzel font-bold tracking-imperial uppercase transition-colors hover:bg-charcoal"
                >
                  RELOAD SYSTEM
                </button>
              </div>
            </div>
          </body>
        </html>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <title>HITCHYARD | System of Record for Freight</title>
        <meta name="description" content="The Governance Protocol for Global Freight Authority. Systematic vetting, rate-locking, and transparent settlement infrastructure." />
      </head>
      <body className={`${cinzel.variable} ${spartan.variable} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
