'use client';

import './globals.css';
import './fonts.css';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary - RULER AESTHETIC
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
    console.error('🚨 APPLICATION ERROR:', error);
    console.error('ERROR DETAILS:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <html lang="en">
          <head>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <title>HITCHYARD - Application Error</title>
          </head>
          <body className="antialiased bg-charcoal">
            <div className="min-h-screen flex items-center justify-center p-12">
              <div className="max-w-lg w-full bg-white p-16 rounded-none text-center">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-8 uppercase tracking-[0.2em]">
                  APPLICATION ERROR
                </h1>
                <p className="text-[10px] text-charcoal/60 uppercase tracking-wider mb-8 leading-relaxed">
                  We encountered an issue loading the platform. <br />
                  Please refresh the page or contact support.
                </p>
                {this.state.error && (
                  <details className="text-left text-[9px] text-charcoal/40 font-mono bg-charcoal/5 p-4 rounded-none mb-8">
                    <summary className="cursor-pointer mb-2 uppercase tracking-wider">Technical Details</summary>
                    <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                  </details>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-forest text-white py-5 text-[11px] font-bold tracking-[0.3em] uppercase transition-colors hover:bg-black rounded-none"
                >
                  Reload Platform
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
        <title>HITCHYARD | The Standard in Global Freight Authority</title>
        <meta name="description" content="The Standard in Global Freight Authority. Premium freight marketplace connecting vetted carriers with trusted shippers." />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
