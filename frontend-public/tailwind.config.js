/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'sway': 'sway 3s ease-in-out infinite',
        'pickup': 'pickup 0.3s cubic-bezier(.34,1.56,.64,1) forwards',
        'flip': 'flip 0.5s linear forwards',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        pickup: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(0, -48px) scale(1.1)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}
