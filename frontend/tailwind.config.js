/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: "var(--font-heading)",
        sans: "var(--font-sans)",
      },
      colors: {
        border: "var(--border)",
        "border-warm": "var(--border-warm)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        /* ── Warm editorial extras ── */
        "warm-silver": "var(--warm-silver)",
        "stone-gray": "var(--stone-gray)",
        "olive-gray": "var(--olive-gray)",
        "charcoal-warm": "var(--charcoal-warm)",
        "dark-warm": "var(--dark-warm)",
        parchment: "var(--parchment)",
        ivory: "var(--ivory)",
        "warm-sand": "var(--warm-sand)",
        "dark-surface": "var(--dark-surface)",
        "deep-dark": "var(--deep-dark)",
        "ring-subtle": "var(--ring-subtle)",
        "ring-deep": "var(--ring-deep)",
        "focus-blue": "var(--focus-blue)",
      },
      borderRadius: {
        /* Design system border radius scale */
        "sharp": "4px",
        "subtle": "6px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "comfortable": "8px",
        "generous": "12px",
        "very": "16px",
        "highly": "24px",
        "maximum": "32px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
