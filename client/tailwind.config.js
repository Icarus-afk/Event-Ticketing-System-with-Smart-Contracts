/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}',
    './node_modules/preline/preline.js',],
  plugins: 'preline/plugin',
  theme: {
    extend: {},
  }
}

