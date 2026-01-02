/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: The 'content' array is required for Next.js to generate styles
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        display: ['-apple-system', 'BlinkMacSystemFont', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'var(--font-mono)', 'monospace'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      colors: {
        navy: { 950: '#020617', 900: '#0B1121', 850: '#111827', 800: '#1f2937' },
        slate: { 850: '#1e293b', 900: '#0f172a' },
        deep: { 900: '#020410' }, // Nuevo color ultra oscuro para la isla
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'sovereign': '0 25px 50px -12px rgba(2, 6, 23, 0.12), 0 0 1px rgba(2, 6, 23, 0.1)',
        'precision': '0 0 0 1px rgba(15, 23, 42, 0.05), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 40px rgba(59, 130, 246, 0.25)',
        'island': '0 15px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08) inset',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up-toast': 'slideUpToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathing': 'deepBreath 10s ease-in-out infinite',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite', 
        'spin-process': 'spin 3s linear infinite',
        'text-glow': 'textGlow 1.5s ease-in-out infinite alternate',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)",
      },
      keyframes: {
        fadeInUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideUpToast: { from: { opacity: 0, transform: 'translateY(50px) scale(0.9)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-20px) translateX(-50%)' }, to: { opacity: 1, transform: 'translateY(0) translateX(-50%)' } },
        deepBreath: { '0%, 100%': { transform: 'scale(0.92)', filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.1))' }, '50%': { transform: 'scale(1.08)', filter: 'drop-shadow(0 0 50px rgba(59, 130, 246, 0.3))' } },
        soundWave: { '0%, 100%': { height: '20%' }, '50%': { height: '80%' } },
        textGlow: { '0%': { opacity: '0.6', textShadow: '0 0 5px rgba(59, 130, 246, 0)' }, '100%': { opacity: '1', textShadow: '0 0 20px rgba(59, 130, 246, 0.6)' } }
      }
    }
  },
  plugins: [],
}        