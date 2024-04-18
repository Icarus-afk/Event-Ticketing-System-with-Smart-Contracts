import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  plugins: [daisyui],
  theme: {
    extend: {},
  },
}

