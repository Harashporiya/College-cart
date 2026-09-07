/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // `animate-fadeIn` and `animate-slideUp` are used in the chatbot and a
      // few modals, but `theme.extend` was empty - so Tailwind generated no
      // such utilities and those elements appeared with no animation at all.
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        slideUp: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
