import { createElement } from 'react'
import type React from 'react'
import { theme, type ThemeConfig } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Palette } from './palette'

/** Available color themes. To add one: add a key here and an entry in THEMES. */
export const ThemeMode = {
  Light: 'light',
  Dark: 'dark',
} as const

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode]

export const DEFAULT_THEME: ThemeMode = ThemeMode.Light

const shared: ThemeConfig['token'] = {
  borderRadius: 8,
  colorPrimary: Palette.primary,
  colorInfo: Palette.primary,
  colorBgMask: Palette.overlay,
}

export const THEMES: Record<ThemeMode, { icon: React.ReactNode; config: ThemeConfig }> = {
  [ThemeMode.Light]: {
    icon: createElement(SunOutlined),
    config: {
      algorithm: theme.defaultAlgorithm,
      token: {
        ...shared,
        colorTextBase: Palette.navy800,
        colorBgBase: Palette.white,
        colorBgLayout: Palette.primaryTint,
        colorBgContainer: Palette.white,
        colorLink: Palette.primary,
      },
    },
  },
  [ThemeMode.Dark]: {
    icon: createElement(MoonOutlined),
    config: {
      algorithm: theme.darkAlgorithm,
      token: {
        ...shared,
        colorTextBase: Palette.white,
        colorBgBase: Palette.navy950,
        colorBgLayout: Palette.navy950,
        colorBgContainer: Palette.navy900,
        colorBgElevated: Palette.navy850,
        colorBorder: Palette.navy800,
        colorBorderSecondary: Palette.navy800,
        colorLink: Palette.primaryLight,
      },
    },
  },
}
