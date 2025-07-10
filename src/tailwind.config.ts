
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Alegreya', 'sans-serif'],
        headline: ['Alegreya', 'serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--dynamic-background) / <alpha-value>)',
        foreground: 'hsl(var(--dynamic-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--dynamic-card) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--dynamic-popover) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--dynamic-primary) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--dynamic-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--dynamic-muted) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--dynamic-accent) / <alpha-value>)',
          foreground: 'hsl(var(--dynamic-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--dynamic-border) / <alpha-value>)',
        input: 'hsl(var(--dynamic-input) / <alpha-value>)',
        ring: 'hsl(var(--dynamic-ring) / <alpha-value>)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--dynamic-radius)',
        md: 'calc(var(--dynamic-radius) - 2px)',
        sm: 'calc(var(--dynamic-radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "marquee": {
          "from": { transform: 'translateX(0)' },
          "to": { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "marquee": "marquee 15s linear infinite",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
