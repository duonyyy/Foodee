import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
      tiny: ["0.75rem", { lineHeight: "1rem" }],
      md: ["1rem", { lineHeight: "1.5rem" }],
      elg: ["1.125rem", { lineHeight: "1.75rem" }],
      exl: ["1.25rem", { lineHeight: "1.75rem" }],
      e2xl: ["1.5rem", { lineHeight: "2rem" }],
      e3xl: ["1.875rem", { lineHeight: "2.25rem" }],
      e4xl: ["2.25rem", { lineHeight: "2.5rem" }],
      e5xl: ["3rem", { lineHeight: "1" }],
      e6xl: ["3.75rem", { lineHeight: "1" }],
      e7xl: ["4.5rem", { lineHeight: "1" }],
      e8xl: ["6rem", { lineHeight: "1" }],
      display: [
        "clamp(2.35rem, 5vw, 4.5rem)",
        {
          lineHeight: "1.04",
          letterSpacing: "-0.035em",
          fontWeight: "700",
        },
      ],
      "page-title": [
        "clamp(2rem, 4vw, 3.5rem)",
        {
          lineHeight: "1.12",
          letterSpacing: "-0.025em",
          fontWeight: "700",
        },
      ],
      "section-title": [
        "clamp(1.5rem, 2.4vw, 2.25rem)",
        {
          lineHeight: "1.15",
          letterSpacing: "-0.025em",
          fontWeight: "700",
        },
      ],
      body: ["1rem", { lineHeight: "1.7" }],
      metadata: [
        "0.8125rem",
        {
          lineHeight: "1.25rem",
          letterSpacing: "0.035em",
          fontWeight: "600",
        },
      ],
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        display: [
          "var(--font-display)",
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "serif",
        ],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        disabled: {
          DEFAULT: "hsl(var(--disabled))",
          foreground: "hsl(var(--disabled-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
        },
        brandSolid: {
          DEFAULT: "hsl(var(--brand-solid))",
          foreground: "hsl(var(--brand-solid-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        // Kept as a compatibility alias for existing screens.
        teriary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        borderSecondary: "hsl(var(--border-secondary))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        navigation: "hsl(var(--navigation))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      boxShadow: {
        control: "var(--shadow-control)",
        card: "var(--shadow-card)",
        floating: "var(--shadow-floating)",
      },
      keyframes: {
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-right": "fade-in-right 0.5s",
        "fade-in-left": "fade-in-left 0.5s",
      },
      spacing: {
        page: "clamp(1rem, 4vw, 3rem)",
        section: "clamp(3.5rem, 8vw, 7rem)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
