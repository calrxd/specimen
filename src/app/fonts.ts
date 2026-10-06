import localFont from 'next/font/local'

/**
 * Self-hosted so the site makes no third-party request and builds offline.
 * Files come from @fontsource / @fontsource-variable (SIL Open Font License).
 */
export const plexMono = localFont({
  src: [
    { path: '../fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/ibm-plex-mono-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})

export const archivo = localFont({
  src: [{ path: '../fonts/archivo-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})
