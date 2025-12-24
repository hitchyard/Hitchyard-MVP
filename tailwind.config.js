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
        // IMPERIAL PROTOCOL - THE LAW OF COLOR
        charcoal: '#1A1D21',            // AUTHORITY: Primary brand color
        forest: '#0B1F1A',              // VERIFIED: Financial/Trust status
        'pure-white': '#FFFFFF',        // High contrast
        
        // Aliases for backward compatibility
        'charcoal-black': '#1A1D21',
        'hitchyard-charcoal': '#1A1D21',
        'deep-forest-green': '#0B1F1A',
        'hitchyard-green': '#0B1F1A',
        
        // Surface colors
        surface: '#FFFFFF',
        'surface-secondary': '#F8F8F8',
        'secondary-surface': '#F8F8F8',
        'text-primary': '#1A1D21',
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
        '200': '50rem',  // py-[200px] = 800px vertical
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
