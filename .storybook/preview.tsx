import * as React from 'react'
import type { Preview, Decorator } from '@storybook/nextjs-vite'
import { archivo, plexMono } from '../src/app/fonts'
import '../src/app/globals.css'

/**
 * Every story renders inside the same frame the app uses: ink ground, paper text,
 * mono by default, and both font variables bound. Anything that looks right here
 * looks right in the app, which is what makes a story usable as a Figma spec.
 */
/**
 * The font variables have to sit on the html element too, as they do in layout.tsx. The
 * token --p-font-family-mono is declared on :root and reads var(--font-plex-mono) there;
 * with the variable only on a wrapper div it resolved to nothing and every story fell
 * back to the browser serif.
 */
if (typeof document !== 'undefined') {
  document.documentElement.classList.add(plexMono.variable, archivo.variable)
}

/**
 * The generated CSS switches theme on `:root[data-theme]`, the html element, so the
 * attribute has to land there. A wrapper div carrying it changes nothing.
 */
function ThemeSync({ theme }: { theme: string }) {
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return null
}

const withSpecimenFrame: Decorator = (Story, context) => {
  const padded = context.parameters.layout !== 'fullscreen'
  const theme = context.globals.theme ?? 'dark'
  return (
    <div
      className={`${plexMono.variable} ${archivo.variable} font-mono`}
      style={{
        background: 'var(--color-canvas)',
        color: 'var(--color-ink)',
        padding: padded ? 'var(--spacing-3xl)' : 0,
        minHeight: '100vh',
      }}
    >
      <ThemeSync theme={theme} />
      <Story />
    </div>
  )
}

const preview: Preview = {
  // data-theme is what the generated CSS switches on, so the toolbar sets it directly
  // rather than through a second mechanism that could drift from the app.
  globalTypes: {
    theme: {
      description: 'Colour theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withSpecimenFrame],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Foundations', ['Colour', 'Type', 'Spacing'], 'Components', '*'],
      },
    },
    backgrounds: { disable: true },
    docs: { codePanel: true },
  },
  tags: ['autodocs'],
}

export default preview
