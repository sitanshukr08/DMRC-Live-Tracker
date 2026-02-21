cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'metro-yellow': '#FFCC00',
        'metro-blue': '#0066CC',
        'metro-green': '#4CAF50',
        'metro-red': '#F44336',
      },
    },
  },
  plugins: [],
}
EOF