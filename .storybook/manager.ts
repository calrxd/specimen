import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

/**
 * The Storybook shell in specimen's colours: ink ground, paper text, the sample green for
 * selection, hairline borders and the mark's 4px corner. Literal values because the manager
 * runs outside the app and cannot read the token CSS; they match the dark theme in
 * tokens/specimen.tokens.json.
 */
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'specimen_ storybook',
    brandUrl: 'https://specimen.systems/docs',
    brandTarget: '_self',

    colorPrimary: '#2CE98F',
    // Storybook fills the selected story with this and sets white text on it. The bright sample
    // green would leave that text near 1.4:1, so selection uses green/800, the light theme's
    // sample, which holds white text above 5:1.
    colorSecondary: '#07753F',

    appBg: '#0B0C0B',
    appContentBg: '#0B0C0B',
    appPreviewBg: '#0B0C0B',
    appBorderColor: '#22261F',
    appBorderRadius: 4,

    fontBase: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontCode: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',

    textColor: '#F2F4F1',
    textInverseColor: '#0B0C0B',
    textMutedColor: '#8B928C',

    barTextColor: '#8B928C',
    barHoverColor: '#F2F4F1',
    barSelectedColor: '#2CE98F',
    barBg: '#101211',

    buttonBg: '#101211',
    buttonBorder: '#3A4038',
    booleanBg: '#101211',
    booleanSelectedBg: '#22261F',

    inputBg: '#101211',
    inputBorder: '#5E665C',
    inputTextColor: '#F2F4F1',
    inputBorderRadius: 4,
  }),
})
