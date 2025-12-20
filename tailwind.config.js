/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colors - Ruler Archetype (Shorthand)
        'charcoal': '#1A1D21',            // PRIMARY: Authority for core platform/safety
        'forest': '#0B1F1A',              // SECONDARY: Trust for financial/vetting/payments
        'white': '#FFFFFF',               // Contrast for logos/text
        
        // Aliases for backward compatibility
        'charcoal-black': '#1A1D21',
        'hitchyard-charcoal': '#1A1D21',
        'deep-forest-green': '#0B1F1A',
        'hitchyard-green': '#0B1F1A',
        'pure-white': '#FFFFFF',
        
        // Light Mode Surface & Text Colors (A&F-style)
        'surface': '#FFFFFF',
        'surface-secondary': '#F8F8F8',
        'secondary-surface': '#F8F8F8',
        'text-primary': '#1A1D21',
        'text-secondary': '#4B5563',
        'off-white-bg': '#F5F5F7',
      },
      borderRadius: {
        'none': '0',                        // Ruler Archetype: Stability through geometry
      },
      fontFamily: {
        // TYPOGRAPHY SYSTEM - Ruler Archetype
        // Primary: Cinzel (serif) for headings - HITCHYARD, authoritative titles
        'serif': ['Cinzel', 'serif'],
        'cinzel': ['Cinzel', 'serif'],
        'cinzel-bold': ['Cinzel', 'serif'],
        // Secondary: League Spartan (sans-serif) for body text, UI elements
        'sans': ['League Spartan', 'sans-serif'],
        'league-spartan': ['League Spartan', 'sans-serif'],
        'spartan': ['League Spartan', 'sans-serif'],
      },
      spacing: {
        // LAYOUT RULE: Enforce ample spacing and thick margins
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
    },
  },
  plugins: [
    function({ addBase, addUtilities }) {
      addBase({
        // IMPERIAL AUTHORITY: Zero border radius globally
        'button, input, textarea, select, div, a': {
          'border-radius': '0 !important',
        },
      });
      addUtilities({
        '.rounded-none': {
          'border-radius': '0 !important',
        },
      });
    },
  ],
};
