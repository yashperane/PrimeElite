/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          accentHover: 'var(--color-accent-hover)',
          calloutTipBg: 'var(--callout-tip-bg)',
          calloutTipBorder: 'var(--callout-tip-border)',
          calloutExampleBg: 'var(--callout-example-bg)',
          calloutExampleBorder: 'var(--callout-example-border)',
          calloutWarningBg: 'var(--callout-warning-bg)',
          calloutWarningBorder: 'var(--callout-warning-border)',
          calloutNoteBg: 'var(--callout-note-bg)',
          calloutNoteBorder: 'var(--callout-note-border)',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        mukta: ['Mukta', 'sans-serif'],
        serif: ['"Noto Serif Devanagari"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
