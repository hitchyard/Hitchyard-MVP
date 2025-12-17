/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 1. BRAND COLORS (Must be exactly these values)
        'charcoal-black': '#1A1D21',
        'deep-forest-green': '#0B1F1A',
        'pure-white': '#FFFFFF',
        // Optional: A light gray for subtle backgrounds/dividers
        'off-white-bg': '#F5F5F7',
      },
      fontFamily: {
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
