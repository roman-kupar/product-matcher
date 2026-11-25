import { createContext, useContext, useEffect, useState } from 'react'
import type React from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { DEFAULT_LANGUAGE, LANGUAGES, type Language, type TranslationKey } from './languages'
import { DEFAULT_THEME, THEMES, type ThemeMode } from '../theme/themes'

interface Settings {
  language: Language
  setLanguage: (language: Language) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  /** Looks up a text in the current language and fills `{placeholders}`. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const SettingsContext = createContext<Settings | null>(null)

/** State persisted in localStorage; falls back to the default if the stored value is unknown. */
function useStored<T extends string>(key: string, allowed: Record<T, unknown>, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored !== null && stored in allowed ? (stored as T) : fallback
  })
  useEffect(() => localStorage.setItem(key, value), [key, value])
  return [value, setValue]
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useStored<Language>('language', LANGUAGES, DEFAULT_LANGUAGE)
  const [themeMode, setThemeMode] = useStored<ThemeMode>('theme', THEMES, DEFAULT_THEME)
  const { messages, antdLocale } = LANGUAGES[language]

  const t: Settings['t'] = (key, params = {}) =>
    messages[key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <SettingsContext.Provider value={{ language, setLanguage, themeMode, setThemeMode, t }}>
      <ConfigProvider locale={antdLocale} theme={THEMES[themeMode].config}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): Settings {
  const settings = useContext(SettingsContext)
  if (!settings) throw new Error('useSettings must be used inside <SettingsProvider>')
  return settings
}
