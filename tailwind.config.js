/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Savana palette
        savana: {
          sky: '#fef3c7',      // sabah göğü
          sun: '#fcd34d',      // güneş sarısı
          earth: '#c2956a',    // toprak rengi
          grass: '#a37448',    // kuru çimen
          mountain: '#8b6f4a', // dağ
          bark: '#5d4037',     // ağaç kabuğu
          leaf: '#2e7d32',     // yaprak
          deep: '#5d2906',     // koyu kahve (yazılar)
          accent: '#d97706',   // turuncu vurgu
        },
        // Renk ramps - karakterler ve modüller için
        rhino: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        mango: {
          light: '#fde68a',
          DEFAULT: '#f59e0b',
          dark: '#92400e',
        },
      },
      fontFamily: {
        // Çocuk dostu, yuvarlak fontlar
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Kalın kart gölgeleri - çocuk uygulamaları için
        'kid': '0 4px 0 #5d2906',
        'kid-hover': '0 7px 0 #5d2906',
        'kid-active': '0 1px 0 #5d2906',
      },
      animation: {
        'bob': 'bob 3s ease-in-out infinite',
        'jump': 'jump 0.5s ease',
        'waggle': 'waggle 0.4s ease',
        'drift': 'drift 30s linear infinite',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        jump: {
          '0%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-20px) rotate(-12deg)' },
          '100%': { transform: 'translateY(0) rotate(0)' },
        },
        waggle: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        drift: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(40px)' },
        },
      },
    },
  },
  plugins: [],
}

