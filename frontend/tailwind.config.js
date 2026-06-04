/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#020617',       // slate-950 (main background)
          card: '#0f172a',     // slate-900 (cards background)
          border: '#1e293b',   // slate-800 (clean borders)
          cyan: '#06b6d4',     // cyan-500 (brand color)
          cyanLight: '#22d3ee',// cyan-400 (bright accent)
          blue: '#2563eb',     // blue-600 (complementary accent)
          text: '#f8fafc',     // slate-50 (primary text)
          muted: '#94a3b8',    // slate-400 (secondary text)
          success: '#10b981',  // emerald-500
          warning: '#f59e0b',  // amber-500
          danger: '#ef4444'    // red-500
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'cyan-glow-heavy': '0 0 25px -2px rgba(6, 182, 212, 0.55)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backdropFilter: {
        'glass-blur': 'blur(12px)'
      }
    },
  },
  plugins: [],
}
