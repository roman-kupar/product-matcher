/** Brand colors. Reference these names in theme configs instead of raw hex values. */
export const Palette = {
  white: '#ffffff',
  black: '#000000',
  overlay: '#0000004d',

  primary: '#5658fb',
  primaryLight: '#8e90fc',
  primaryTint: '#eeeeff',

  navy950: '#0b0b12',
  navy900: '#16172f',
  navy850: '#1b1b27',
  navy800: '#1e1f45',
} as const

export type PaletteColor = (typeof Palette)[keyof typeof Palette]
