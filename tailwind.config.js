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
        // IMPERIAL PROTOCOL - THE LAW OF COLOR (CSS variables for v0 Design Mode)
        charcoal: 'var(--brand-charcoal)',            // AUTHORITY: Primary brand color
        forest: 'var(--brand-forest)',                // VERIFIED: Financial/Trust status
        'pure-white': 'var(--contrast-white)',        // High contrast
        // Aliases for backward compatibility
        'charcoal-black': 'var(--brand-charcoal)',
        'hitchyard-charcoal': 'var(--brand-charcoal)',
        'deep-forest-green': 'var(--brand-forest)',
        'hitchyard-green': 'var(--brand-forest)',
        // Surface colors
        surface: 'var(--contrast-white)',
        'surface-secondary': '#F8F8F8',
        'secondary-surface': '#F8F8F8',
        'text-primary': 'var(--brand-charcoal)',
        'text-secondary': '#4B5563',
        'off-white-bg': '#F5F5F7',
      },
      fontFamily: {
        // IMPERIAL PROTOCOL - THE LAW OF TYPOGRAPHY
        cinzel: ['Cinzel', 'serif'],           // Headlines: Cinzel Bold
        spartan: ['League Spartan', 'sans-serif'],  // Body: League Spartan
      },
      letterSpacing: {
        imperial: '0.6em',  // Headlines tracking
        command: '0.4em',   // Secondary tracking
        wide: '0.2em',      // Body tracking
      },
      borderRadius: {
        none: '0',
      },
      spacing: {
        // THE LAW OF SPACE: Art Gallery spacing
        'imperial': '800px', // py-imperial = 800px vertical
        '200': '50rem',
      },
    },
  },
  plugins: [
    function({ addBase, addUtilities, theme }) {
      // Global enforcement: Zero border radius
      addBase({
        '*': {
          borderRadius: '0 !important',
          boxShadow: 'none !important',
        },
        'button, input, textarea, select': {
          borderRadius: '0 !important',
        },
      });
      
      addUtilities({
        '.rounded-none': {
          borderRadius: '0 !important',
        },
        '.no-shadow': {
          boxShadow: 'none !important',
        },
      });
    },
  ],
};
