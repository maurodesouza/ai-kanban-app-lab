import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: 'hsla(var(--background-base))',
          support: 'hsla(var(--background-support))',
        },
        foreground: {
          min: 'hsla(var(--foreground-min))',
          base: 'hsla(var(--foreground))',
          max: 'hsla(var(--foreground-max))',
        },
        ring: {
          inner: 'hsla(var(--ring-inner))',
          outer: 'hsla(var(--ring-outer))',
        },
        tone: {
          'contrast-100': 'hsla(var(--tone-contrast-100))',
          'contrast-200': 'hsla(var(--tone-contrast-200))',
          'contrast-300': 'hsla(var(--tone-contrast-300))',
          'contrast-400': 'hsla(var(--tone-contrast-400))',
          'contrast-500': 'hsla(var(--tone-contrast-500))',
          'luminosity-100': 'hsla(var(--tone-luminosity-100))',
          'luminosity-200': 'hsla(var(--tone-luminosity-200))',
          'luminosity-300': 'hsla(var(--tone-luminosity-300))',
          'luminosity-400': 'hsla(var(--tone-luminosity-400))',
          'luminosity-500': 'hsla(var(--tone-luminosity-500))',
          'ring-inner': 'hsla(var(--tone-ring-inner))',
          'ring-outer': 'hsla(var(--tone-ring-outer))',
          'foreground-contrast': 'hsla(var(--tone-foreground-contrast))',
          'foreground-context': 'hsla(var(--tone-foreground-context))',
        }
      },
      spacing: {
        'xxs': 'var(--spacing-xxs)',
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'md': 'var(--text-md)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      fontFamily: {
        'sans': 'var(--font-sans)',
      },
      screens: {
        'mobile': 'var(--breakpoint-mobile)',
        'tablet': 'var(--breakpoint-tablet)',
        'laptop': 'var(--breakpoint-laptop)',
        'desktop': 'var(--breakpoint-desktop)',
      }
    },
  },
  plugins: [],
}

export default config
