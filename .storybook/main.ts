import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  // Pro stories build only when STORYBOOK_PRO=1. The public Storybook (deployed by CI on every
  // push) never sets it, so Pro code never reaches storybook.specimen.systems.
  stories: [
    '../src/!(components)/**/*.stories.@(ts|tsx)',
    '../src/components/!(pro)/**/*.stories.@(ts|tsx)',
    '../src/components/*.stories.@(ts|tsx)',
    ...(process.env.STORYBOOK_PRO === '1' ? ['../src/components/pro/**/*.stories.@(ts|tsx)'] : []),
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    // The same engine scripts/build-contract.mjs uses, so the prop table shown in
    // Storybook and the contract the Figma library is built from come from one parse.
    // It reads the TypeScript compiler API, which is why this repo pins typescript to
    // 5.x rather than the 7.x native preview.
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
