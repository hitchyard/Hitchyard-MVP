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
        // Core brand colors for high-contrast accents
        'charcoal-black': '#1A1D21',
        'hitchyard-charcoal': '#1A1D21',  // Used for text/accents
        'deep-forest-green': '#0B1F1A',
        'hitchyard-green': '#0B1F1A',     // Used for buttons/trust elements
        'pure-white': '#FFFFFF',
        
        // New Light Mode Surface & Text Colors
        'surface': '#FFFFFF',             // Pure White (A&F-style background)
        'surface-secondary': '#F8F8F8',   // Light Gray (subtle section backgrounds)
        'secondary-surface': '#F8F8F8',   // Alias
        'text-primary': '#1A1D21',        // Charcoal Black (main text)
        'text-secondary': '#4B5563',      // Dark Gray (supporting text)
        'off-white-bg': '#F5F5F7',
      },
      fontFamily: {
        // 2. TYPOGRAPHY SYSTEM
        'serif': ['Cinzel', 'serif'],
        'cinzel-bold': ['Cinzel', 'serif'],
        'sans': ['League Spartan', 'sans-serif'],
        'league-spartan': ['League Spartan', 'sans-serif'],
      },
        // 2. TYPOGRAPHY SYSTEM
        // Primary for headings (HITCHYARD, Access Network)
        'serif': ['Cinzel', 'serif'],
        // Secondary for UI, body, buttons (clean, authoritative)
        'sans': ['League Spartan', 'sans-serif'],
      },
      spacing: {
        // 3. LAYOUT RULE: Enforce ample spacing and thick margins
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem', // Use for large vertical padding/gaps
      }
    },
  },
  plugins: [],
};
